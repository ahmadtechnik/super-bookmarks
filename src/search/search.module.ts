import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ItemModule } from '../item/item.module';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [ItemModule, TagModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
