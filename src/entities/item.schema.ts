import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Score, ScoreSchema } from './score.schema';
import { Tag } from './tag.schema';
import { ItemType } from './item-type.enum';

export type ItemDocument = HydratedDocument<Item>;

@Schema({ collection: 'items', timestamps: true })
export class Item {
  @Prop({ type: String, required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ type: String, default: '', trim: true })
  description: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: Tag.name }],
    default: [],
  })
  tags: Types.ObjectId[];

  @Prop({ type: String, enum: ItemType, required: true })
  type: ItemType;

  @Prop({ type: [ScoreSchema], default: [] })
  scores: Score[];

  @Prop({ type: Boolean, default: false })
  isFav: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metaData: Record<string, unknown>;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
