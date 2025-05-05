//apps\api\src\user\user.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserRole } from '../../common/constants/user-role.enum';
import * as bcrypt from 'bcryptjs';

/**
 * DTO seguro para retorno de informações do usuário (sem dados sensíveis)
 * @class SafeUserDto
 */
export class SafeUserDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID único do usuário',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'E-mail cadastrado',
    maxLength: 254,
  })
  email: string;

  @ApiProperty({
    example: 'Nome Completo',
    description: 'Nome de exibição do usuário',
  })
  name: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.BUSINESS,
    description: 'Tipo de perfil do usuário',
  })
  role: UserRole;

  @ApiProperty({
    example: '12.345.678/0001-99',
    required: false,
    description: 'CNPJ da empresa (caso role = BUSINESS)',
  })
  cnpj?: string;

  @ApiProperty({
    example: 'moto',
    required: false,
    description: 'Tipo de veículo (caso role = MOTOBOY)',
  })
  vehicleType?: string;

  @ApiProperty({
    example: '000.000.000-00',
    required: false,
    description: 'CPF do usuário (caso role = MOTOBOY)',
  })
  cpf?: string;

  @ApiProperty({
    example: '(00) 00000-0000',
    required: false,
    description: 'Telefone do usuário (caso role = MOTOBOY)',
  })
  phone?: string;

  @ApiProperty({
    example: '00000-000',
    required: false,
    description: 'CEP do usuário (caso role = MOTOBOY)',
  })
  cep?: string;

  @ApiProperty({
    example: 'Estado',
    required: false,
    description: 'Estado do usuário (caso role = MOTOBOY)',
  })
  state?: string;

  @ApiProperty({
    example: 'Cidade',
    required: false,
    description: 'Cidade do usuário (caso role = MOTOBOY)',
  })
  city?: string;

  @ApiProperty({
    example: 'Endereço',
    required: false,
    description: 'Endereço do usuário (caso role = MOTOBOY)',
  })
  street?: string;

  @ApiProperty({
    example: 'Complemento',
    required: false,
    description: 'Complemento do endereço do usuário (caso role = MOTOBOY)',
  })
  complement?: string;

  @ApiProperty({
    example: '123',
    required: false,
    description: 'Número do endereço do usuário (caso role = MOTOBOY)',
  })
  number?: string;

  @ApiProperty({
    example: '12345678901',
    required: false,
    description: 'Número da CNH do usuário (caso role = MOTOBOY)',
  })
  cnh?: string;
}

/**
 * Serviço responsável por operações relacionadas a usuários
 * @class UserService
 */
@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  /**
   * Retorna todos os usuários cadastrados, sem incluir senha
   * @returns {Promise<SafeUserDto[]>}
   */
  async findAll(): Promise<SafeUserDto[]> {
    const users = await this.userModel
      .find()
      .select('-passwordHash')
      .lean()
      .exec();
    return users.map((user) => this.toSafeUserDto(user));
  }

  /**
   * Busca um usuário pelo ID, omitindo a senha
   * @param {string} id - ID do usuário
   * @returns {Promise<SafeUserDto | null>}
   */
  async findOne(id: string): Promise<SafeUserDto | null> {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash')
      .lean()
      .exec();
    return user ? this.toSafeUserDto(user) : null;
  }

  /**
   * Alias para findOne
   * @param {string} id - ID do usuário
   * @returns {Promise<SafeUserDto | null>}
   */
  async findById(id: string): Promise<SafeUserDto | null> {
    return this.findOne(id);
  }

  /**
   * Retorna o documento completo de um usuário, com ou sem hash da senha
   * @param id - ID do usuário
   * @param includePasswordHash - Se deve incluir passwordHash
   * @returns {Promise<UserDocument | null>}
   */
  async findCompleteUserById(
    id: string,
    includePasswordHash = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findById(id);
    const finalQuery = includePasswordHash
      ? query
      : query.select('-passwordHash');
    return finalQuery.exec();
  }

  /**
   * Busca um usuário por e-mail.
   * Se `includePasswordHash` for `true`, retorna o UserDocument com a senha.
   * Caso contrário, retorna o DTO seguro (sem senha).
   * @param email - E-mail do usuário
   * @param includePasswordHash - Se deve incluir passwordHash
   * @returns {Promise<SafeUserDto | UserDocument | null>}
   */
  async findByEmail(
    email: string,
    includePasswordHash: boolean = false,
  ): Promise<SafeUserDto | UserDocument | null> {
    const query = this.userModel.findOne({ email });
    const finalQuery = includePasswordHash
      ? query
      : query.select('-passwordHash');
    const user = await finalQuery.exec();

    if (!user) return null;

    return includePasswordHash ? user : this.toSafeUserDto(user.toObject());
  }

  /**
   * Cria um novo usuário, gerando e salvando o hash da senha
   * @param {CreateUserDto} data - Dados de criação
   * @returns {Promise<SafeUserDto>}
   */
  async create(data: CreateUserDto): Promise<SafeUserDto> {
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const createdUser = await this.userModel.create({
      email: data.email,
      name: data.name,
      role: data.role,
      cnpj: data.cnpj,
      vehicleType: data.vehicleType,
      cpf: data.cpf,
      phone: data.phone,
      cep: data.cep,
      state: data.state,
      city: data.city,
      street: data.street,
      complement: data.complement,
      number: data.number,
      cnh: data.cnh,
      passwordHash,
    });

    return this.toSafeUserDto(createdUser.toObject());
  }

  /**
   * Busca um usuário com a senha (usado em login)
   * @param email - E-mail do usuário
   * @returns {Promise<UserDocument | null>}
   */
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+passwordHash').exec();
  }

  /**
   * Converte um documento ou objeto de usuário em SafeUserDto
   * @param user - Documento ou objeto plain
   * @returns {SafeUserDto}
   */
  private toSafeUserDto(user: any): SafeUserDto {
    if (!user) throw new Error('User object is required');

    return {
      id: user._id?.toString() || user.id,
      email: user.email || '',
      name: user.name || '',
      role: user.role || UserRole.GUEST,
      cnpj: user.cnpj,
      vehicleType: user.vehicleType,
      cpf: user.cpf,
      phone: user.phone,
      cep: user.cep,
      state: user.state,
      city: user.city,
      street: user.street,
      complement: user.complement,
      number: user.number,
      cnh: user.cnh,
    };
  }
}
