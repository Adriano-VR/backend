import { Module } from '@nestjs/common';
import { QueryParserService } from './query-parser.service';

@Module({
  providers: [QueryParserService],
  exports: [QueryParserService],
})
export class QueryParserModule {}
