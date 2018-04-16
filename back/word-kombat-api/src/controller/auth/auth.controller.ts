import {Body, Controller, HttpException, HttpStatus, Post} from '@nestjs/common';
import {UserRepository} from "../../repository/user/user.repository";
import {ApiImplicitBody, ApiUseTags} from "@nestjs/swagger";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {User} from "../../entity/user.entity";
import {IsDefined, IsEmail, IsString, Length} from "class-validator";
import {Dto} from "nestjs-extensions";

@Dto()
export class SignInRequest {
    @IsDefined()
    @IsString()
    @Length(2, 50)
    username: string;


    @IsDefined()
    @IsString()
    @Length(6, 50)
    password: string;
}

@Dto()
export class SignUpRequest {
    @IsDefined()
    @IsEmail()
    email: string;


    @IsDefined()
    @IsString()
    @Length(2, 50)
    name: string;

    @IsDefined()
    @IsString()
    @Length(2, 50)
    password: string;
}

@ApiUseTags('auth')
@Controller('/api/auth')
export class AuthController {

    private readonly ROBOHASH_URL = 'https://robohash.org/';

    constructor(private readonly userRepository: UserRepository) {
    }

    @ApiImplicitBody(SignInRequest)
    @Post('/signin')
    async signIn(@Body() req: SignInRequest): Promise<{ token: string }> {
        const user = await this.userRepository.findByName(req.username);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        } else if (bcrypt.compareSync(req.password, user.password)) {
            const token = jwt.sign({id: user.id, name: user.name}, String(process.env.JWT_SECRET), {
                expiresIn: String(process.env.JWT_EXPIRES)
            });

            return {token}
        } else {
            throw new HttpException('Incorrect password', HttpStatus.FORBIDDEN);
        }
    }

    @ApiImplicitBody(SignUpRequest)
    @Post('/signup')
    async signUp(@Body() req: SignUpRequest): Promise<{ token: string }> {
        const searchResult = await this.userRepository.findByEmail(req.email);

        if (searchResult) {
            throw new HttpException('User Already Exists', HttpStatus.CONFLICT);
        } else {
            const user = await this.userRepository.add(Object.assign({}, req, {
                password: await bcrypt.hash(req.password, 8),
                icon: this.ROBOHASH_URL + req.name,
                score: 0,
            } as User));

            const token = jwt.sign({id: user.id, name: user.name}, String(process.env.JWT_SECRET), {
                expiresIn: String(process.env.JWT_EXPIRES)
            });

            return {token}
        }
    }

}
