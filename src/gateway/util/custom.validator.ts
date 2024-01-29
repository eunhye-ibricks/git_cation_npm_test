import { Transform } from 'class-transformer';

export function TransformBoolean() {
  return Transform((value: any) => {
    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    }
    // return value;
  });
}
