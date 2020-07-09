import { interval, of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';

export function rangedTimer(from: number, to: number) {
  return interval()
    .pipe(
      concatMap(index => {
          const delayTime = Math.floor(Math.random() * (1 + to - from)) + from;
          return of(index)
            .pipe(
              delay(delayTime),
            );
        },
      ),
    );
}
