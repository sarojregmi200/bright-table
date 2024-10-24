import React from 'react';
import { fireEvent } from '@testing-library/react';

import { getDOMNode, getInstance } from './utils';
import Scrollbar from '../src/Scrollbar';

describe('Scrollbar', () => {
  it('Should output a scrollbar', () => {
    const instance = getDOMNode(<Scrollbar />);
    assert.include(instance.className, 'bright-scrollbar');
  });

  it('Should be vertical', () => {
    const instance = getDOMNode(<Scrollbar vertical />);

    assert.ok(instance.className.match(/\bvertical\b/));
  });

  it('Should render a scroll handle', () => {
    const scrollLength = 1000;
    const length = 100;
    const instance = getInstance(<Scrollbar scrollLength={scrollLength} length={length} />);

    assert.equal(instance.handle.style.width, `${scrollLength / length}%`);
  });

  it('Should call onMouseDown callback', () => {
    const onMouseDownSpy = sinon.spy();
    const instance = getInstance(<Scrollbar onMouseDown={onMouseDownSpy} />);

    fireEvent.mouseDown(instance.handle);

    expect(onMouseDownSpy).to.have.been.calledOnce;
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instance = getDOMNode(<Scrollbar style={{ fontSize }} />);
    assert.equal(instance.style.fontSize, fontSize);
  });

  it('Should not call `onScroll` callback', () => {
    const instance = getInstance(<Scrollbar length={100} scrollLength={1000} onScroll={scroll} />);
    instance.onWheelScroll(100);
    expect(
      instance.root.innerHTML.match(/translate3d\(\d+px,\s*(\d+)px,\s*(\d+)px\)/i)[0]
    ).be.equal('translate3d(10px, 0px, 0px)');
  });
});
