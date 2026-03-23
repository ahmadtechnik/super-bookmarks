import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTagDto } from '../DTOs/tag/create-tag.dto';
import { UpdateTagDto } from '../DTOs/tag/update-tag.dto';
import { Tag, TagDocument } from '../entities/tag.schema';

interface RawTagRecord {
  _id: { toString(): string };
  content: string;
  category: string;
}

@Injectable()
export class TagService {
  constructor(
    @InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const createdTag = await this.tagModel.create(createTagDto);
    return this.serializeTag(createdTag.toObject());
  }

  async findAll() {
    const tags = (await this.tagModel
      .find()
      .sort({ content: 1 })
      .lean()) as unknown as RawTagRecord[];
    return tags.map((tag) => this.serializeTag(tag));
  }

  async findOne(tagId: string) {
    const tag = (await this.tagModel
      .findById(tagId)
      .lean()) as RawTagRecord | null;
    if (!tag) {
      throw new NotFoundException(`Tag ${tagId} was not found.`);
    }

    return this.serializeTag(tag);
  }

  async update(tagId: string, updateTagDto: UpdateTagDto) {
    const tag = (await this.tagModel
      .findByIdAndUpdate(tagId, updateTagDto, { new: true })
      .lean()) as RawTagRecord | null;
    if (!tag) {
      throw new NotFoundException(`Tag ${tagId} was not found.`);
    }

    return this.serializeTag(tag);
  }

  async remove(tagId: string) {
    const tag = await this.tagModel.findByIdAndDelete(tagId).lean();
    if (!tag) {
      throw new NotFoundException(`Tag ${tagId} was not found.`);
    }

    return { deleted: true, tagId };
  }

  private serializeTag(tag: RawTagRecord) {
    return {
      id: tag._id.toString(),
      content: tag.content,
      category: tag.category,
    };
  }
}
