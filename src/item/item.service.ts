import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { AddScoreDto } from '../DTOs/item/add-score.dto';
import { CreateItemDto } from '../DTOs/item/create-item.dto';
import {
  ITEM_BUNDLE_FORMAT,
  ITEM_BUNDLE_VERSION,
  ItemBundleDto,
  ItemBundleItemDto,
  ItemBundleTagDto,
} from '../DTOs/item/item-bundle.dto';
import { UpdateItemDto } from '../DTOs/item/update-item.dto';
import { SearchItemsQueryDto } from '../DTOs/search/search-items-query.dto';
import { Item, ItemDocument } from '../entities/item.schema';
import { ItemType } from '../entities/item-type.enum';
import { ScoreType } from '../entities/score-type.enum';
import { Tag, TagDocument } from '../entities/tag.schema';

interface RawScoreRecord {
  type: string;
  score: number;
  triggeredDate: string | Date;
}

interface RawTagRecord {
  _id: { toString(): string };
  content: string;
  category: string;
}

interface RawItemRecord {
  _id: { toString(): string };
  title: string;
  description: string;
  type: ItemType;
  isFav: boolean;
  metaData: Record<string, unknown>;
  scores: RawScoreRecord[];
  tags?: RawTagRecord[];
}

export interface SerializedTag {
  id: string;
  content: string;
  category: string;
}

export interface SerializedItem {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  isFav: boolean;
  metaData: Record<string, unknown>;
  totalScore: number;
  scoreCount: number;
  latestScoreDate: string | null;
  tags: SerializedTag[];
}

export interface ItemImportSummary {
  created: number;
  updated: number;
  tagsCreated: number;
  totalItems: number;
  totalTags: number;
}

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Item.name) private readonly itemModel: Model<ItemDocument>,
    @InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>,
  ) {}

  async create(createItemDto: CreateItemDto) {
    if (createItemDto.tags?.length) {
      await this.ensureTagsExist(createItemDto.tags);
    }

    const createdItem = await this.itemModel.create({
      ...createItemDto,
      tags: createItemDto.tags ?? [],
      description: createItemDto.description ?? '',
      metaData: createItemDto.metaData ?? {},
      scores: [],
      isFav: createItemDto.isFav ?? false,
    });

    return this.findOne(createdItem._id.toString());
  }

  async findAll(query: SearchItemsQueryDto) {
    const items = (await this.itemModel
      .find()
      .populate('tags')
      .lean()) as unknown as RawItemRecord[];
    return this.filterAndSortItems(items, query);
  }

  async findOne(itemId: string) {
    const item = (await this.itemModel
      .findById(itemId)
      .populate('tags')
      .lean()) as RawItemRecord | null;
    if (!item) {
      throw new NotFoundException(`Item ${itemId} was not found.`);
    }

    return this.serializeItem(item);
  }

  async update(itemId: string, updateItemDto: UpdateItemDto) {
    if (updateItemDto.tags?.length) {
      await this.ensureTagsExist(updateItemDto.tags);
    }

    const updatedItem = await this.itemModel
      .findByIdAndUpdate(itemId, updateItemDto, { new: true })
      .populate('tags')
      .lean();

    if (!updatedItem) {
      throw new NotFoundException(`Item ${itemId} was not found.`);
    }

    return this.serializeItem(updatedItem as unknown as RawItemRecord);
  }

  async remove(itemId: string) {
    const removedItem = await this.itemModel.findByIdAndDelete(itemId).lean();
    if (!removedItem) {
      throw new NotFoundException(`Item ${itemId} was not found.`);
    }

    return { deleted: true, itemId };
  }

  async getScores(itemId: string) {
    const item = await this.itemModel.findById(itemId).lean();
    if (!item) {
      throw new NotFoundException(`Item ${itemId} was not found.`);
    }

    return item.scores.map((score) => ({
      type: score.type,
      triggeredDate: new Date(score.triggeredDate).toISOString(),
      score: score.score,
    }));
  }

  async addScore(itemId: string, addScoreDto: AddScoreDto) {
    const item = await this.itemModel.findById(itemId);
    if (!item) {
      throw new NotFoundException(`Item ${itemId} was not found.`);
    }

    item.scores.push({
      type: addScoreDto.type,
      score: addScoreDto.score ?? this.getDefaultScore(addScoreDto.type),
      triggeredDate: addScoreDto.triggeredDate
        ? new Date(addScoreDto.triggeredDate)
        : new Date(),
    });
    await item.save();

    return this.findOne(itemId);
  }

  async exportBundle(): Promise<ItemBundleDto> {
    const [items, tags] = await Promise.all([
      this.itemModel.find().populate('tags').lean(),
      this.tagModel.find().sort({ content: 1 }).lean(),
    ]);

    return {
      format: ITEM_BUNDLE_FORMAT,
      version: ITEM_BUNDLE_VERSION,
      exportedAt: new Date().toISOString(),
      tags: (tags as unknown as RawTagRecord[]).map((tag) => ({
        content: tag.content,
        category: tag.category as Tag['category'],
      })),
      items: (items as unknown as RawItemRecord[]).map((item) => ({
        sourceKey: this.buildItemSourceKey({
          title: item.title,
          type: item.type,
          metaData: item.metaData,
        }),
        title: item.title,
        description: item.description,
        type: item.type,
        isFav: item.isFav,
        metaData: item.metaData,
        tags: (item.tags ?? []).map((tag) => ({
          content: tag.content,
          category: tag.category as Tag['category'],
        })),
        scores: item.scores.map((score) => ({
          type: score.type as ScoreType,
          score: score.score,
          triggeredDate: new Date(score.triggeredDate).toISOString(),
        })),
      })),
    };
  }

  async importBundle(bundle: ItemBundleDto): Promise<ItemImportSummary> {
    if (bundle.format !== ITEM_BUNDLE_FORMAT) {
      throw new BadRequestException(
        `Unsupported import format: ${bundle.format}.`,
      );
    }

    if (bundle.version !== ITEM_BUNDLE_VERSION) {
      throw new BadRequestException(
        `Unsupported import version: ${bundle.version}.`,
      );
    }

    const incomingTags = this.collectBundleTags(bundle);
    const existingTags = await this.tagModel.find().lean();
    const tagMap = new Map(
      (existingTags as unknown as RawTagRecord[]).map((tag) => [
        this.getTagKey(tag.content, tag.category),
        tag,
      ]),
    );

    let tagsCreated = 0;
    for (const tag of incomingTags) {
      const tagKey = this.getTagKey(tag.content, tag.category);
      if (tagMap.has(tagKey)) {
        continue;
      }

      const createdTag = await this.tagModel.create(tag);
      tagMap.set(tagKey, createdTag.toObject() as unknown as RawTagRecord);
      tagsCreated += 1;
    }

    const existingItems = (await this.itemModel.find().lean()) as unknown as RawItemRecord[];
    const itemIdBySourceKey = new Map(
      existingItems.map((item) => [
        this.buildItemSourceKey({
          title: item.title,
          type: item.type,
          metaData: item.metaData,
        }),
        item._id.toString(),
      ]),
    );

    let created = 0;
    let updated = 0;

    for (const item of bundle.items) {
      const sourceKey = item.sourceKey?.trim().length
        ? item.sourceKey
        : this.buildItemSourceKey(item);
      const resolvedTagIds = (item.tags ?? [])
        .map((tag) => tagMap.get(this.getTagKey(tag.content, tag.category)))
        .filter((tag): tag is RawTagRecord => Boolean(tag))
        .map((tag) => tag._id.toString());

      const payload = {
        title: item.title,
        description: item.description ?? '',
        type: item.type,
        isFav: item.isFav ?? false,
        metaData: item.metaData ?? {},
        tags: resolvedTagIds,
        scores: (item.scores ?? []).map((score) => ({
          type: score.type,
          score: score.score,
          triggeredDate: new Date(score.triggeredDate),
        })),
      };

      const existingItemId = itemIdBySourceKey.get(sourceKey);
      if (existingItemId) {
        await this.itemModel.findByIdAndUpdate(existingItemId, payload, {
          new: true,
        });
        updated += 1;
        continue;
      }

      const createdItem = await this.itemModel.create(payload);
      itemIdBySourceKey.set(sourceKey, createdItem._id.toString());
      created += 1;
    }

    return {
      created,
      updated,
      tagsCreated,
      totalItems: bundle.items.length,
      totalTags: incomingTags.length,
    };
  }

  private async ensureTagsExist(tagIds: string[]) {
    if (!tagIds.every((tagId) => isValidObjectId(tagId))) {
      throw new BadRequestException(
        'Each tag id must be a valid Mongo ObjectId.',
      );
    }

    const count = await this.tagModel.countDocuments({ _id: { $in: tagIds } });
    if (count !== tagIds.length) {
      throw new NotFoundException('One or more tags do not exist.');
    }
  }

  private filterAndSortItems(
    items: RawItemRecord[],
    query: SearchItemsQueryDto,
  ): SerializedItem[] {
    const normalizedQuery = query.q?.trim().toLowerCase();

    let results = items.map((item) => this.serializeItem(item));

    if (query.type) {
      results = results.filter((item) => item.type === query.type);
    }

    if (query.onlyFavorites) {
      results = results.filter((item) => item.isFav);
    }

    if (normalizedQuery) {
      results = results.filter((item) => {
        const tagMatch = item.tags.some((tag) =>
          tag.content.toLowerCase().includes(normalizedQuery),
        );
        const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
        const descriptionMatch = item.description
          .toLowerCase()
          .includes(normalizedQuery);
        const typeMatch = item.type.toLowerCase().includes(normalizedQuery);

        switch (query.t) {
          case 'title':
            return titleMatch;
          case 'description':
            return descriptionMatch;
          case 'tag':
            return tagMatch;
          case 'type':
            return typeMatch;
          default:
            return titleMatch || descriptionMatch || tagMatch || typeMatch;
        }
      });
    }

    if (query.groupBy && query.groupValue) {
      const groupValue = query.groupValue;
      results = results.filter((item) => {
        switch (query.groupBy) {
          case 'tag':
            return item.tags.some((tag) => tag.content === groupValue);
          case 'type':
            return item.type === (groupValue as ItemType);
          case 'title':
            return (
              item.title.charAt(0).toUpperCase() === groupValue.toUpperCase()
            );
          default:
            return true;
        }
      });
    }

    const sorted = results.sort((left, right) => {
      if (left.isFav !== right.isFav) {
        return left.isFav ? -1 : 1;
      }

      switch (query.sortBy) {
        case 'scoreCount':
          return right.scoreCount - left.scoreCount;
        case 'title':
          return left.title.localeCompare(right.title);
        case 'latestScoreDate':
          return (right.latestScoreDate ?? '').localeCompare(
            left.latestScoreDate ?? '',
          );
        case 'totalScore':
        default:
          return right.totalScore - left.totalScore;
      }
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  }

  private collectBundleTags(bundle: ItemBundleDto): ItemBundleTagDto[] {
    const tagMap = new Map<string, ItemBundleTagDto>();

    for (const tag of bundle.tags ?? []) {
      tagMap.set(this.getTagKey(tag.content, tag.category), tag);
    }

    for (const item of bundle.items) {
      for (const tag of item.tags ?? []) {
        tagMap.set(this.getTagKey(tag.content, tag.category), tag);
      }
    }

    return [...tagMap.values()].sort((left, right) =>
      left.content.localeCompare(right.content),
    );
  }

  private getTagKey(content: string, category: string) {
    return `${content.trim().toLowerCase()}::${category}`;
  }

  private buildItemSourceKey(
    item: Pick<ItemBundleItemDto, 'title' | 'type' | 'metaData'>,
  ) {
    return [
      item.type,
      item.title.trim().toLowerCase(),
      this.stableSerialize(item.metaData ?? {}),
    ].join('::');
  }

  private stableSerialize(value: unknown): string {
    if (Array.isArray(value)) {
      return `[${value.map((entry) => this.stableSerialize(entry)).join(',')}]`;
    }

    if (value && typeof value === 'object') {
      return `{${Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => `${key}:${this.stableSerialize(entry)}`)
        .join(',')}}`;
    }

    return JSON.stringify(value);
  }

  private serializeItem(item: RawItemRecord): SerializedItem {
    const totalScore = item.scores.reduce(
      (sum: number, score: { score: number }) => sum + score.score,
      0,
    );
    const scoreCount = item.scores.length;
    const latestScoreDate = item.scores.length
      ? new Date(
          item.scores[item.scores.length - 1].triggeredDate,
        ).toISOString()
      : null;

    return {
      id: item._id.toString(),
      title: item.title,
      description: item.description,
      type: item.type,
      isFav: item.isFav,
      metaData: item.metaData,
      totalScore,
      scoreCount,
      latestScoreDate,
      tags: (item.tags ?? []).map((tag) => ({
        id: tag._id.toString(),
        content: tag.content,
        category: tag.category,
      })),
    };
  }

  private getDefaultScore(type: ScoreType) {
    return type === ScoreType.COPY ? 0.1 : 0.1;
  }
}
