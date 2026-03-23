import { Injectable } from '@nestjs/common';
import { SearchItemsQueryDto } from '../DTOs/search/search-items-query.dto';
import { ItemService } from '../item/item.service';
import { TagService } from '../tag/tag.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly itemService: ItemService,
    private readonly tagService: TagService,
  ) {}

  async search(query: SearchItemsQueryDto): Promise<Record<string, unknown>> {
    const [items, availableTags] = await Promise.all([
      this.itemService.findAll(query),
      this.tagService.findAll(),
    ]);

    return {
      items,
      availableTags,
      query,
    };
  }
}
