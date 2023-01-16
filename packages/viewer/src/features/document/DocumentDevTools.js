import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  usePopulateDocumentResponsesMutation,
  useClearDocumentResponsesMutation,
} from "../api/apiSlice";
// import { fetchResponses, selectCurrentDocumentId } from './responsesSlice'
// import { fetchEnrollment } from '../topic/currentEnrollmentSlice'

export const DocumentDevTools = () => {
  /*
  const dispatch = useDispatch()
  const currentDocumentId = useSelector(selectCurrentDocumentId)

  const [populateDocumentResponses, { isPopulating }] = usePopulateDocumentResponsesMutation()
  const [clearDocumentResponses, { isClearing }] = useClearDocumentResponsesMutation()

  const reloadParticipationData = () => {
    dispatch(fetchResponses(currentDocumentId))
    // AWKWARD: Reloading enrollment has no effect on UI right now
    // because document completions will need to be calculated on the fly
    // for them to update correctly in the nav ...
    // leaving the call below because it should work eventually,
    // even if it doesn't work right now
    // dispatch(fetchEnrollment(topicId))
  }

  const handlePopulateDocumentClick = async () => {
    try {
      await populateDocumentResponses(currentDocumentId).unwrap()
    } catch (err) {
      console.error('Failed to populate document responses:', err)
    }
    reloadParticipationData()
  }

  const handleClearDocumentClick = async () => {
    try {
      await clearDocumentResponses(currentDocumentId).unwrap()
    } catch (err) {
      console.error('Failed to clear document responses:', err)
    }
    reloadParticipationData()
  }

  const style = {
    border: '1px dashed black',
    backgroundColor: '#fcf9cc',
    padding: '5px',
    marginBottom: '5px'
  }

  return <div style={style}>
    <button onClick={ handlePopulateDocumentClick }>Populate document responses</button>&nbsp;
    <button onClick={ handleClearDocumentClick }>Clear document responses</button>
  </div>
  */

  return null;
};
