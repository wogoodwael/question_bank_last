import React from "react";
import { Link } from "react-router-dom";
import TableSi from "../../components/TableSi/TableSi";

import styles from "./homeSi.module.scss"

const HomeSi = () => {
  return (
    <div className={`container  ${styles.home}`}>
      <div className={styles.questionType}>
        <p>Select a question type: </p>
        <ul>
          <li>
           
          </li>
          <li>
  
          </li>
          <li>
    
          </li>
        </ul>
      </div>
      <TableSi/>
    </div>
  );
};

export default HomeSi;
