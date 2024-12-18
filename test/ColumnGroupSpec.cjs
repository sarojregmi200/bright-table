import React from 'react';

import { getDOMNode } from './utils';
import ColumnGroup from '../src/ColumnGroup';

// eslint-disable-next-line react/prop-types
const Item = ({ className, style, children, headerHeight }) => (
  <div className={className} style={{ height: headerHeight, ...style }}>
    {children}
  </div>
);

describe('ColumnGroup', () => {
  it('Should output a ColumnGroup', () => {
    const instance = getDOMNode(<ColumnGroup />);

    assert.equal(instance.className, 'bright-column-group');
  });

  it('Should output a header', () => {
    const instance = getDOMNode(<ColumnGroup header={'header'} />);
    assert.equal(instance.innerText, 'header');
  });

  it('Should render 2 cells', () => {
    const instance = getDOMNode(
      <ColumnGroup>
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(instance.querySelectorAll('.bright-column-group-cell-content').length, 2);
  });

  it('Should set height 10 for header', () => {
    const instance = getDOMNode(
      <ColumnGroup headerHeight={20} header={'header'}>
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(instance.querySelector('.bright-column-group-header').style.height, '10px');
    assert.equal(
      instance.querySelector('.bright-column-group-header-content').style.height,
      '10px'
    );
    assert.equal(instance.querySelector('.bright-column-group-cell').style.height, '10px');
  });

  it('Should render height via groupHeaderHeight', () => {
    const instance = getDOMNode(
      <ColumnGroup headerHeight={20} groupHeaderHeight={5} header={'header'}>
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(instance.querySelector('.bright-column-group-header').style.height, '5px');
    assert.equal(instance.querySelector('.bright-column-group-header-content').style.height, '5px');
    assert.equal(instance.querySelector('.bright-column-group-cell').style.height, '15px');
  });

  it('Should be centered vertically', () => {
    const instance = getDOMNode(
      <ColumnGroup header={'header'} verticalAlign="middle">
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    expect(instance.querySelector('.bright-column-group-header-content')).to.have.style(
      'align-items',
      'center'
    );
  });

  it('Should have a custom className prefix', () => {
    const instance = getDOMNode(
      <ColumnGroup classPrefix="my">
        <Item>a</Item>
        <Item>b</Item>
      </ColumnGroup>
    );

    assert.equal(instance.className, 'bright-my');
    assert.ok(instance.querySelector('.bright-my-header'));
  });
});
