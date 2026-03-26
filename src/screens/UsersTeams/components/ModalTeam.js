// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useEffect, useState } from 'react'
// import { FormattedMessage } from 'react-intl';
// import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// import { useSelector, useDispatch } from "react-redux";
// import { Input, FormGroup, } from 'reactstrap';
// import AutoSuggest from "react-autosuggest";
// import http from "../../../services/http'
// import { auth } from '../../../utils/statusUser'
// import { createTeams } from "../../../redux/actions/UsersTeams/teams.actions"
// import InitialUser from '../../../components/InitialUser';

// const ModalTeam = () => {
//     const dispatch = useDispatch();
//     const state = useSelector(state => state)
//     const teamsRequest = state.teams.teamsRequest
//     const teams = state.teams
//     const rootId = state.userDataRole.rootId
//     const [modal, setModal] = useState(false);

//     const [dataUser, setDataUser] = useState([]);
//     const [searchLead, setSearchLead] = useState("");
//     const [searchMembers, setSearchMembers] = useState("");

//     const [name, setName] = useState("");
//     const [teamLeadId, setTeamLeadId] = useState('');
//     const [memberSug, setMemberSug] = useState({});
//     const [membersAdd, setMembersAdd] = useState([]);
//     const [teamMembers, setTeamMembers] = useState([]);
//     const [selectSuggest, setSelectSuggest] = useState(false);

//     useEffect(() => {
//         if (teams) {
//             setModal(false)
//         }
//     }, [teams]);
//     const handleTeam = () => {
//         const payload = { name, teamLeadId, teamMembers }
//         if (name && teamLeadId && teamMembers) {
//             dispatch(createTeams(payload))
//         }
//     }

//     const getSuggestionsSearch = async (value) => {
//         if (value.length >= 3) {
//             http.get(`/users/search?rootId=${rootId}&search=${value}`)
//                 .then((data) => {
//                     setDataUser(data.list);
//                 })
//         }
//     }
//     function getSuggestTeamLead(suggestion) {
//         if (suggestion.teamId === null) {
//             setTeamLeadId(suggestion.id)
//         }
//         const val = `${suggestion.firstName} ${suggestion.lastName}`
//         return val;
//     }

//     function getSuggestMembers(suggestion) {
//         setMemberSug(suggestion)
//         if (suggestion.teamId === null) {
//             setSelectSuggest(true)
//         }
//         const val = `${suggestion.firstName} ${suggestion.lastName}`
//         return val;
//     }
//     const addMembers = () => {
//         let check = teamMembers.includes(memberSug.id)
//         if (!check && memberSug.teamId === null) {
//             teamMembers.push(memberSug.id)
//             membersAdd.push(memberSug)
//             setSearchMembers("")
//             setSelectSuggest(false)
//         }
//     }
//     const handleRemoveMember = (id) => {
//         let index = membersAdd?.map(x => { return x.id; }).indexOf(id);
//         membersAdd.splice(index, 1)
//         setMembersAdd([...membersAdd])
//     }
//     const handleCloseModal = () => {
//         setName("")
//         setTeamLeadId("")
//         setMemberSug({})
//         setMembersAdd([])
//         setTeamMembers([])
//         setSearchMembers("")
//         setSelectSuggest(false)
//         setModal(false)
//     }
//     return (
//         <>
//             <Modal isOpen={modal} centered  >
//                 <ModalHeader toggle={() => handleCloseModal()}>
//                     <FormattedMessage id="create.team" />
//                 </ModalHeader>
//                 <ModalBody>
//                     <div>
//                         <FormGroup>
//                             <FormattedMessage id="projects.form.title.placeholder">
//                                 {placeholder =>
//                                     <Input
//                                         size = { "lg"}
//                                         type="text"
//                                         placeholder={placeholder}
//                                         value={name}
//                                         onChange={(e) => setName(e.target.value)}
//                                     />
//                                 }
//                             </FormattedMessage>
//                         </FormGroup>
//                     </div>

//                     <div className="div-search-step-task-user d-flex align-items-center">
//                         <span ><FormattedMessage id="team.leader" /> </span>
//                         <AutoSuggest
//                             suggestions={dataUser}
//                             onSuggestionsFetchRequested={({ value }) => { getSuggestionsSearch(value); }}
//                             onSuggestionsClearRequested={() => setDataUser([])}
//                             getSuggestionValue={getSuggestTeamLead}
//                             renderSuggestion={suggestion =>
//                                 <div className="users-item-guests-add" >
//                                     <InitialUser FirstName={suggestion.firstName} LastName={suggestion.lastName} color={suggestion.color} />
//                                     <div className="users-item-left">
//                                         {suggestion.teamId ?
//                                             <h6 className='disable-search'>{suggestion.firstName} {suggestion.lastName} <small>(<FormattedMessage id="itsinanother.team" />)</small></h6>
//                                             :
//                                             <h6>{suggestion.firstName} {suggestion.lastName} </h6>
//                                         }
//                                         <small>{suggestion.email}</small>
//                                     </div>
//                                 </div>
//                             }
//                             inputProps={{ placeholder: "Search ", value: searchLead, onChange: (_, { newValue, }) => { setSearchLead(newValue); } }}
//                             highlightFirstSuggestion={true}
//                         />
//                     </div>
//                     <hr />
//                     <div>
//                         {membersAdd.map((data, index) =>
//                             <div key={index} className="users-item-guests" >
//                                 <div className="d-flex">
//                                     <InitialUser FirstName={data.firstName} LastName={data.lastName} email={data.email} color={data.color} />
//                                     <div className="users-item-left">
//                                         <h6> {data.firstName} {data.lastName}</h6>
//                                         <small>{data.email}</small>
//                                     </div>
//                                 </div>
//                                 <h6 onClick={() => handleRemoveMember(data.id)} className="remove-guests">
//                                     x
//                                 </h6>
//                             </div>
//                         )}
//                         <div className="div-search-step-task-user d-flex align-items-center">
//                             <span ><FormattedMessage id="team.members" /> </span>
//                             <AutoSuggest
//                                 suggestions={dataUser}
//                                 onSuggestionsFetchRequested={({ value }) => { getSuggestionsSearch(value); }}
//                                 onSuggestionsClearRequested={() => setDataUser([])}
//                                 getSuggestionValue={getSuggestMembers}
//                                 renderSuggestion={suggestion =>
//                                     <div className="users-item-guests-add" >
//                                         <InitialUser FirstName={suggestion.firstName} LastName={suggestion.lastName} color={suggestion.color} />
//                                         <div className="users-item-left">
//                                             {suggestion.teamId ?
//                                                 <h6>{suggestion.firstName} {suggestion.lastName} </h6>
//                                                 :
//                                                 <h6 className='disable-search'>{suggestion.firstName} {suggestion.lastName} <small>(<FormattedMessage id="itsinanother.team" />)</small></h6>
//                                             }
//                                             <small>{suggestion.email}</small>
//                                         </div>
//                                     </div>
//                                 }
//                                 inputProps={{ placeholder: "Search ", value: searchMembers, onChange: (_, { newValue, }) => { setSearchMembers(newValue); } }}
//                                 highlightFirstSuggestion={true}
//                             />
//                             {memberSug?.teamId === null ? <span className={`cursor ${selectSuggest ? "polse" : ""}`} onClick={() => addMembers()}><FormattedMessage id="Add" /> </span> : ""}
//                         </div>
//                     </div>

//                 </ModalBody>
//                 <ModalFooter>
//                     <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleCloseModal()}>
//                         <FormattedMessage id="common.button.close" />
//                     </button>
//                     {' '}
//                     <button type="button" className="btn btn-sm btn-outline-success" onClick={() => handleTeam()} disabled={teamsRequest}>
//                         <FormattedMessage id="common.button.confirm" />
//                     </button>
//                 </ModalFooter>
//             </Modal>
//             <h6>
//                 <FormattedMessage id="create.team" />
//                 <button onClick={() => setModal(true)} className="btn-sm btn-create-circle ml-1 py-2">
//                     <i className="fa-regular fa-square-plus plus"></i>
//                 </button>
//             </h6>

//         </>
//     )
// }

// export default ModalTeam
