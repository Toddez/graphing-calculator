// eslint-disable-next-line
import { processData } from "./EvaluateExpressionWorker";

export class MockedWorker {
  processData(data: string): string {
    return processData(data);
  }
}

export default MockedWorker;
