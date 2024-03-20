import { useRef, useContext } from "react";
import { createBugReport } from "../functions/utilFunctions";
import ModalStateContext from "../store/modal-context";
import './css/ReportBug.css';
const ReportBug = () => {
	const formRef = useRef(null);
	const ctx = useContext(ModalStateContext);

	const formFieldsAreValid = (formData) => {
		if(formData.get('name').trim().length === 0){
			return false;
		}
		else if(formData.get('steps').trim().length === 0){
			return false;
		}
		else{
			return true;
		}
	}

	const submitBugReport = async (e) => {
		e.preventDefault();
		const formData = new FormData(formRef.current);

		if(formFieldsAreValid(formData)){
			const currentDate = new Date();
			// const TIME_ZONE_OFFSET = -360;
			currentDate.setMinutes(currentDate.getMinutes());
			const miliseconds = currentDate.getTime();
			const timestamp = new Date(miliseconds);

			const reqData = {
				'bugId': null,
				'name': formData.get('name').trim(),
				'description': formData.get('description').trim(),
				'steps': formData.get('steps').trim(),
				'timestamp': timestamp.toString()
			}

			const [bugReport, createBugReportErrorMsg] = await createBugReport(reqData);

			if(createBugReportErrorMsg){
				//console.log(createBugReportErrorMsg);
				return;
			}
		}
		else{
			ctx.onSetInfoModalMessage("Please ensure that both the 'Name' and 'Steps to Recreate' fields are filled out");
			ctx.onModifyModalState('info');
			return;
		}

		formRef.current.reset();
	}

	return (
		<div className="report-bug_page-container">
			<form id="bug-form" ref={formRef} onSubmit={submitBugReport}>

				<div id="bug-name_block" className="report-bug_input-block">
					<label htmlFor="bug-name">
						Bug Name:
					</label>
					<input id="bug-name" type="text" name="name"/>
				</div>

				<div id="description_block" className="report-bug_input-block">
					<label htmlFor="description">
						Description (Optional):
					</label>
					<textarea id="description" type="text" name="description"/>
				</div>

				<div id="steps_block" className="report-bug_input-block">
					<label htmlFor="steps">
						Steps to Recreate:
					</label>
					<textarea id="steps" type="text" name="steps"/>
				</div>

				<div id="bug-form_actions">
					<button type="submit">Submit Bug</button>
				</div>

			</form>
		</div>
	)
}

export default ReportBug;