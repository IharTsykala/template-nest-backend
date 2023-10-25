//types
import { CommonArgumentsInterface, CommonResponseInterface } from 'src/types';

export class CommonResponseBody {
  static commonResponse({
    status,
    description,
    example,
  }: CommonArgumentsInterface<unknown>): CommonResponseInterface<unknown> {
    return {
      status,
      description: description,
      schema: {
        example,
      },
    };
  }
}
