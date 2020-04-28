import React from 'react';
import Searchbar from './Search';

import './ClientPage.scss';

export default function ClientPage() {
  return (
    <>
      <div style={{textAlign: 'center'}}>
        <h1 style={{color:`royalblue`, fontSize: '50px'}}>P2Wiki</h1>
        <Searchbar/>
      </div>
      <footer className="footer">
        <div style={{textAlign: 'center'}}>
          <p style={{color:`hotpink`}}>
            P2Wiki made by Subin Siby, Pranav Shridhar and Athul Cyriac Ajay
          </p>
        </div>
      </footer>
    </>
  )
}
