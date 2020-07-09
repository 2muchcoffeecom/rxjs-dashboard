import React from 'react';
import { render } from '@testing-library/react';
import { TestScheduler } from 'rxjs/testing';
import App, { combineSystemsData, getData } from './App';
import DisplayObject from '../DisplayObject/DisplayObject';

const schedulerHandler = (actual: any, expected: any) => {
  expect(actual).toEqual(expected);
}

test('renders App without crashing', () => {
  const {baseElement} = render(<App/>);
  expect(baseElement).toBeInTheDocument();
});

test('renders DisplayObject props', () => {
  const {baseElement} = render(<DisplayObject title='test' value={'2'}/>);
  expect(baseElement).toHaveTextContent('test');
  expect(baseElement).toHaveTextContent('2');
});

test('emits no more than 100 milliseconds', () => {
  new TestScheduler(schedulerHandler).run(({expectObservable, hot, flush}) => {
    expectObservable(
      combineSystemsData(
        hot('a 50ms b 50ms c 50ms d 50ms e'),
        hot('a'),
        hot('a'),
      )
    )
    .toBe(
      'a 101ms b 101ms c',
      {a: ['a', 'a', 'a'], b: ['c', 'a', 'a'], c: ['e', 'a', 'a']},
    );
  })
});

test('combined emit after emitted all systems', () => {
  new TestScheduler(schedulerHandler).run(({expectObservable, hot, flush}) => {
    expectObservable(
      combineSystemsData(
        hot('200ms a 200ms b', {a: '1', b: '2'}),
        hot('250ms a', {a: '1'}),
        hot('1000ms a', {a: '1'}),
      ),
    )
    .toBe(
      '1000ms a',
      {a: ['2', '1', '1']},
    );
  })
});

test('emit N/A when second request longer then 1000ms', () => {
  new TestScheduler(schedulerHandler).run(({expectObservable, hot, flush}) => {
    expectObservable(
      getData(
        hot('a 1500ms b', {a: '1', b: '2'})
      ),
      '1850ms !',
    )
    .toBe(
      'a 999ms b 500ms c',
      {a: '1', b: 'N/A', c: '2'},
    );
  })
});

test('first request longer then 1000ms', () => {
  new TestScheduler(schedulerHandler).run(({expectObservable, hot, flush}) => {
    expectObservable(
      getData(
        hot('1500ms a 300ms b', {a: '1', b: '2'})
      ),
      '1850ms !',
    )
    .toBe(
      '1500ms a 300ms b',
      {a: '1', b: '2'},
    );
  })
});
