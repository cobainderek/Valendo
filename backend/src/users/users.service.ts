import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, tag, email, password } = createUserDto;

    // Verifica se usuário ou email já existem
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { tag }],
      },
    });

    if (existingUser) {
      throw new ConflictException('O e-mail ou a tag já estão em uso.');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        name,
        tag,
        email,
        passwordHash,
      },
    });

    // Removemos a senha do retorno (não é boa prática retornar ela)
    // Além disso, mapeamos o bigInt pra string se for o caso
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
