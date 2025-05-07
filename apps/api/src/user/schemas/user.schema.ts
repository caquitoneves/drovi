// apps/api/src/user/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../../common/constants/user-role.enum';

export type UserDocument = User & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.GUEST })
  role: UserRole;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: false })
  cnpj?: string;

  @Prop({ required: false })
  cpf?: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  cep?: string;

  @Prop({ required: false })
  state?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  street?: string;

  @Prop({ required: false })
  complement?: string;

  @Prop({ required: false })
  number?: string;

  @Prop({ required: false })
  cnh?: string;

  @Prop({ default: 'local' })
  provider: 'local' | 'google';
}

export const UserSchema = SchemaFactory.createForClass(User);
