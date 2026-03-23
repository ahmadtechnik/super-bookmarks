import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ScoreType } from './score-type.enum';

@Schema({ _id: false })
export class Score {
  @Prop({ type: String, enum: ScoreType, required: true })
  type: ScoreType;

  @Prop({ type: Date, required: true, default: () => new Date() })
  triggeredDate: Date;

  @Prop({ type: Number, required: true, min: 0.1, max: 1 })
  score: number;
}

export const ScoreSchema = SchemaFactory.createForClass(Score);
