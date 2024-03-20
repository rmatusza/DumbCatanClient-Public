import { useEffect, useState } from 'react';
import { deleteBugReport, fetchBugList } from '../functions/utilFunctions';
import './css/BugList.css';
const lod = require('lodash');

const BugList = () => {
  const [bugList, setBugList] = useState([]);
  const [reportNum, setReportNum] = useState(0);

  useEffect(async () => {
    const [bugReports, fetchBugReportsErrorMsg] = await fetchBugList();

    if(fetchBugReportsErrorMsg){
      ctx.onSetInfoModalMessage(fetchBugReportsErrorMsg);
			ctx.onModifyModalState('info');
			return;
    }
    setBugList(bugReports);
  }, [])

  const bugNavigationHandler = (direction) => {
    if(direction === 'forward'){
      setReportNum(() => reportNum + 1);
    }
    else{
      setReportNum(() => reportNum - 1);
    }
  }

  const getNextReportNum = (bugListCpy) => {
    if(reportNum === 0){
      return 0;
    }
    if(reportNum <= bugListCpy.length -1){
      return reportNum;
    }
    return reportNum - 1;
  }

  const deleteReportHandler = async () => {
    const [deletedReport, deleteBugReportErrorMsg] = await deleteBugReport(bugList[reportNum].bugId);

    if(deleteBugReportErrorMsg){
      ctx.onSetInfoModalMessage(deleteBugReportErrorMsg);
			ctx.onModifyModalState('info');
			return;
    }

    const bugListCpy = lod.cloneDeep(bugList);
    bugListCpy.splice(reportNum, 1);
    setReportNum(() => getNextReportNum(bugListCpy));
    setBugList(bugListCpy);
  }

  return (
    <div className="bug-list_page-container">
      <div className='bug-list_bugs-container'>
        {
          bugList.length > 0
          &&
          <div className='bug-container'>
            <h3>Name:</h3>
            <div id='name_bug-report'>
              <p>{bugList[reportNum].name}</p>
            </div>
            <h3>Description:</h3>
            <div id='description_bug-report'>
              <p>{bugList[reportNum].description}</p>
            </div>
            <h3>Steps to Recreate:</h3>
            <div id='steps_bug-report'>
              <p>{bugList[reportNum].steps}</p>
            </div>
          </div>
        }
        <div id='nav-buttons_bug-list'>
          {
            reportNum > 0
            &&
            <button onClick={() => bugNavigationHandler('back')}>Previous Report</button>
          }
          {
            bugList.length > 0
            &&
            <button onClick={deleteReportHandler}>Delete Report</button>
          }
          {
            reportNum < bugList.length -1
            &&
            <button onClick={() => bugNavigationHandler('forward')}>Next Report</button>
          }
        </div>
      </div>
    </div>
  )
}

export default BugList;