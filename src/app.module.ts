import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CleckAuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module'
@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: CleckAuthGuard
    }
  ],
  imports: [
    AuthModule,
    PrismaModule
  ],
})
export class AppModule { }
