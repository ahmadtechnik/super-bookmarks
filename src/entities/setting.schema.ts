import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ collection: 'settings', timestamps: true })
export class Setting {
  @Prop({ type: String, required: true, unique: true })
  key: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  value: Record<string, unknown>;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
