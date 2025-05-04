import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserRole } from '../../../common/constants/user-role.enum';
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
   * Busca todos os usuários (sem retornar passwordHash)
   * @method findAll
   * @returns {Promise<SafeUserDto[]>} Lista de usuários sem informações sensíveis
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
   * Busca um usuário por ID (sem retornar passwordHash)
   * @method findOne
   * @param {string} id - ID do usuário
   * @returns {Promise<SafeUserDto | null>} Usuário encontrado ou null
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
   * Busca um usuário por ID (alias para findOne)
   * @method findById
   * @param {string} id - ID do usuário
   * @returns {Promise<SafeUserDto | null>} Usuário encontrado ou null
   */
  async findById(id: string): Promise<SafeUserDto | null> {
    return this.findOne(id);
  }

  /**
   * Busca um documento completo do usuário por ID (para uso interno)
   * @param id - ID do usuário
   * @param includePasswordHash - Se deve incluir a hash de senha
   * @returns UserDocument completo ou null
   */
  public async findCompleteUserById(
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
   * Busca um usuário por email
   * @method findByEmail
   * @param {string} email - Email do usuário
   * @param {boolean} [includePasswordHash=false] - Se deve incluir a hash de senha
   * @returns {Promise<SafeUserDto | null>} Usuário encontrado ou null
   */
  async findByEmail(
    email: string,
    includePasswordHash: boolean = false,
  ): Promise<SafeUserDto | null> {
    const query = this.userModel.findOne({ email });
    const finalQuery = includePasswordHash
      ? query
      : query.select('-passwordHash');
    const user = await finalQuery.lean().exec();
    return user ? this.toSafeUserDto(user) : null;
  }

  /**
   * Cria um novo usuário e retorna dados sem a senha
   * @method create
   * @param {CreateUserDto} data - Dados do usuário a ser criado
   * @returns {Promise<SafeUserDto>} Usuário criado sem informações sensíveis
   * @throws {Error} Se ocorrer erro na criação
   */
  async create(data: CreateUserDto): Promise<SafeUserDto> {
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const createdUser = await this.userModel.create({
      email: data.email,
      name: data.name,
      role: data.role,
      cnpj: data.cnpj,
      vehicleType: data.vehicleType,
      passwordHash,
    });

    return this.toSafeUserDto(createdUser.toObject());
  }

  /**
   * Busca um usuário incluindo a senha (usado apenas para validação de login)
   * @method findByEmailWithPassword
   * @param {string} email - Email do usuário
   * @returns {Promise<UserDocument | null>} Usuário com hash de senha ou null
   */
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+passwordHash').exec();
  }

  /**
   * Converte um documento de usuário para o DTO seguro
   * @method toSafeUserDto
   * @param user - Documento ou objeto de usuário
   * @returns SafeUserDto
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
    };
  }
}
