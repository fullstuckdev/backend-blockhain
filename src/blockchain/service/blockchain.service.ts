import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class BlockchainService {
  abstract testingDb(): Promise<any>;
  abstract getEth(): Promise<any>;
}
