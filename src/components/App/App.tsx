import React from 'react';
import EventEmitter from 'events';
import {
  distinctUntilChanged,
  map,
  mapTo,
  repeat,
  shareReplay,
  skipUntil,
  take, throttleTime,
} from 'rxjs/operators';
import { combineLatest, fromEvent, interval, merge, Observable, race } from 'rxjs';
import DisplayObject from '../DisplayObject/DisplayObject';
import './App.css';
import { rangedTimer } from '../../utils';

export const getData = (input$: Observable<string>, allowedRequestTime = 1000) => {
  return race(
    input$,
    interval(allowedRequestTime)
    .pipe(
      skipUntil(
        input$.pipe(shareReplay(1)),
      ),
      mapTo('N/A'),
    ),
  )
  .pipe(
    take(1),
    repeat(),
    distinctUntilChanged(),
  )
}

export function combineSystemsData<T>(temperature: Observable<T>, pressure: Observable<T>, humidity: Observable<T>)  {
  return combineLatest([
    temperature,
    pressure,
    humidity
  ])
  .pipe(
    throttleTime(100)
  );
}

const App: React.FC = () => {
  const [temperatureValue, changeTemperature] = React.useState('');
  const [pressureValue, changePressure] = React.useState('');
  const [humidityValue, changeHumidity] = React.useState('');

  React.useEffect(() => {
    const temperature = new EventEmitter();
    const pressure = new EventEmitter();
    const humidity = new EventEmitter();

    const fetchSubscriber = merge(
      fetch(temperature),
      fetch(pressure),
      fetch(humidity),
    )
    .subscribe(({eventEmitter, data}) => {
      eventEmitter.emit('data', `${data}`);
    });

    const getDataSubscriber = combineSystemsData(
      getData(fromEvent<string>(temperature, 'data')),
      getData(fromEvent<string>(pressure, 'data')),
      getData(fromEvent<string>(humidity, 'data')),
    )
    .subscribe(([temperature, pressure, humidity]) => {
      changeTemperature(temperature);
      changePressure(pressure);
      changeHumidity(humidity);
    })

    return () => {
      fetchSubscriber.unsubscribe();
      getDataSubscriber.unsubscribe();
    }
  }, []);

  const fetch = (eventEmitter: EventEmitter) => {
    return rangedTimer(100, 2000)
    .pipe(
      map(data => ({eventEmitter, data})),
    )
  }

  return (
    <div className='App'>
      <header className='App-header'/>
      <main className='App-main'>
        <DisplayObject title={'Temperature'} value={temperatureValue}/>
        <DisplayObject title={'Air pressure'} value={pressureValue}/>
        <DisplayObject title={'Humidity'} value={humidityValue}/>
      </main>
    </div>
  );
}

export default App;
