import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TagCategory } from './tag-category.enum';

export type TagDocument = HydratedDocument<Tag>;

@Schema({ collection: 'tags', timestamps: true })
export class Tag {
  @Prop({ type: String, required: true, trim: true, maxlength: 80 })
  content: string;

  @Prop({
    type: String,
    required: true,
    enum: TagCategory,
    default: TagCategory.OTHER,
  })
  category: TagCategory;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
