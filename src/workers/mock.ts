// eslint-disable-next-line
import { processData } from "./EvaluateExpressionWorker";

export class MockedWorker {
  processData(data: string): Promise<string> {
    return processData(data);
  }
}

export default MockedWorker;
