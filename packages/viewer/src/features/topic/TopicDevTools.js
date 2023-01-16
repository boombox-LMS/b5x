import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  usePopulateTopicResponsesMutation,
  useClearTopicResponsesMutation,
} from "../api/apiSlice";
// import { fetchResponses, selectCurrentDocumentId } from '../document/responsesSlice'
// import { fetchEnrollment } from './currentEnrollmentSlice'

export const TopicDevTools = ({ topicId }) => {
  /*
  const dispatch = useDispatch()
  const currentDocumentId = useSelector(selectCurrentDocumentId)

  const [populateTopicResponses, { isPopulating }] = usePopulateTopicResponsesMutation()
  const [clearTopicResponses, { isClearing }] = useClearTopicResponsesMutation()

  const reloadParticipationData = () => {
    dispatch(fetchResponses(currentDocumentId))
    // AWKWARD: Reloading enrollment has no effect on UI right now
    // because document completions will need to be calculated on the fly
    // for them to update correctly in the nav ...
    // leaving the call below because it should work eventually,
    // even if it doesn't work right now
    dispatch(fetchEnrollment(topicId))
  }

  const handlePopulateTopicClick = async () => {
    try {
      await populateTopicResponses(topicId).unwrap()
    } catch (err) {
      console.error('Failed to populate topic responses:', err)
    }
    reloadParticipationData()
  }

  const handleClearTopicClick = async () => {
    try {
      await clearTopicResponses(topicId).unwrap()
    } catch (err) {
      console.error('Failed to clear topic responses:', err)
    }
    reloadParticipationData()
  }

  const style = {
    border: '1px dashed black',
    backgroundColor: '#fcf9cc',
    padding: '5px'
  }

  return <div style={style}>
    <button onClick={ handlePopulateTopicClick }>Populate topic responses</button>&nbsp;
    <button onClick={ handleClearTopicClick }>Clear topic responses</button>
  </div>
  */

  return null;
};
