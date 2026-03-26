import React from 'react'
import { View, Text, ScrollView, } from 'react-native';
import HeaderInfo from './components/HeaderInfo';
import AppContainerClean from '../../components/AppContainerClean';

const Privacy = (route) => {
    const location = route.navigation.state.params.location;

    return (
        <AppContainerClean location={location}>
            <HeaderInfo location={location} locationActive={"Privacy"} />
            <ScrollView style={{ backgroundColor: "#f8f9fa", }}>
                <View style={{ paddingHorizontal: 10, }}>
                    <Text style={{ fontSize: 22, fontWeight: '600'}}>
                        Terms of Use & Conditions
                    </Text>
                    <View style={{ paddingVertical: 10 }}>
                        <View >
                            <Text style={{ paddingVertical: 10 }}>
                                These terms of use (Terms of Use) contain the terms and conditions that govern your (Client’s) access to and use of the Texxano Application.
                                The Texxano Application is offered to you subject to your acceptance, without modification (other than Special Conditions (as defined below)),
                                of the Terms of Use. When accepted by you, or otherwise in accordance with section 3.1 below, these Terms of Use form a legally binding contract (Contract)
                                between you and the Operator (as defined below).
                            </Text >
                            <Text style={{ paddingVertical: 10 }}>
                                Please read these Terms of Use carefully. By accepting these Terms of Use, you acknowledge that you have read, understood,
                                and agree to be bound by these Terms of Use. If you do not agree to be bound by these Terms of Use, then please do not access
                                or use the Texxano Application.
                            </Text>

                        </View>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}>1. DEFINITIONS</Text>
                        <View>
                            <Text style={{fontSize:16}}>1.1. Special Conditions The conditions by which the Terms of Use are specified, amended or supplemented by agreement of the Parties.</Text>

                            <Text style={{fontSize:16}}>1.2. Operator Teksano DOOEL (Registry Code 7507712, Prashka 21/1-93, 1000 Skopje, Republic of North Macedonia).</Text>

                            <Text style={{fontSize:16}}> 1.3. Information System An integrated cloud solution for the provision of the Services, including applications, software, hardware, databases, interfaces, connected media, documentation, updates, version upgrades and other related components or materials.</Text>

                            <Text style={{fontSize:16}}>1.4. Terms of Use These standard terms of use of the Texxano Application.</Text>

                            <Text style={{fontSize:16}}>1.5. User A natural person who uses the Texxano Application in the name of and under the authorization of the Client.</Text>

                            <Text style={{fontSize:16}}>1.6. User Account The User profile connected to the Client Account for the use of the Texxano Application, which is used to identify the User, provide personal access to the Texxano Application, and to change and save the settings.</Text>

                            <Text style={{fontSize:16}}>1.7. Client Account A profile connected to a specific Client for the use of the Texxano Application used to identify the Client, provide the Users connected to the Client with access to the Texxano Application, and to change and save the settings.</Text>

                            <Text style={{fontSize:16}}>1.8. Client A person operating in the economic and professional activity who has entered into the Contract with the Operator.</Text>
                            <Text style={{fontSize:16}}>1.9. Firm Account A profile used to distinguish between and/or filter the information related to the Client’s different companies or departments within the Client Account (one or several).</Text>

                            <Text style={{fontSize:16}}>1.10. Contract An agreement for the use of the Texxano Application concluded between the Operator and the Client in accordance with section 3 of the Terms of Use.</Text>

                            <Text style={{fontSize:16}}>1.11. Party/Parties In singular, either the Operator or the Client, depending on the context, in plural both.</Text>

                            <Text style={{fontSize:16}}>1.12. Contents The data, works and other materials added by the Users (video, photo, picture, drawing, text, etc.). The Contents include any personal data processed by the Client and/or the Users on the Texxano Application. As such, the data processing agreement between the Client as a data controller and the Operator as a data processor as required under Article 28 of the GDPR is included herein (see section 7 below).</Text>

                            <Text style={{fontSize:16}}>1.13. Texxano Application, and the Information System as a whole, in both the web and mobile.</Text>

                            <Text style={{fontSize:16}}>1.14. Services Any services provided to the Client under the Contract.</Text>

                            <Text style={{fontSize:16}}>1.15. Additional Texxano Application Software installed on the Client’s server or User device in order to synchronize information with the Client’s other solutions and systems, which functions with the corresponding Services.</Text>

                            <Text style={{fontSize:16}}>1.16. Web Site A collection of all domains (such as texxano.com and other websites with the domain name “texxano” registered under various top level domains) and the web documents available via their subdomains (including pictures, videos, PHP and HTML files) that belong to the Operator.</Text>

                            <Text style={{fontSize:16}}>1.17. Privacy Policy A policy that explains how the Operator processes the personal data of the Clients, their representatives, the Users and the marketing leads.</Text>
                        </View>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}> 2. GENERAL PRINCIPLES</Text>

                        <Text style={{fontSize:16}}>2.1. Texxano Application is an integrated software solution for the management of work organization, sales, data sharing between users and comments, and is aimed for use by persons operating in an economic and professional activity.</Text>

                        <Text style={{fontSize:16}}>2.2. It is the responsibility of the Client and the Users to ensure that the Texxano Application functions in accordance with their needs and the requirements arising from applicable laws.</Text>

                        <Text style={{fontSize:16}}>2.3. In order to utilize the full functionality of the Texxano Application, the Client must create a Client Account and, in certain instances, install the Additional Texxano Application onto its server and/or Users’ or mobile Application.</Text>

                        <Text style={{fontSize:16}}>2.4. The Texxano Application may only be used to the extent of and for the purposes of and aims for which the Texxano Application functionality has been created and made available to Clients and Users, or for which the same type of technological solutions is usually used. The use shall be in accordance with the Terms of Use, the guidance, and instructions available in the Texxano Application’s support environment, as well as good practice and the legal acts.</Text>

                        <Text style={{fontSize:16}}>2.5. Neither the Client nor User may:

                            • use the Texxano Application to commit or incite an offence;
                            • use the Texxano Application to the extent that they do not agree with the Terms of Use applied to that part of the Texxano Application;
                            • use the Texxano Application to send advertising materials, spam mail and other Contents to other Users that is in contradiction with the requirements set out in the Terms of Use;
                            • use the Texxano Application in any other illegal way;
                            • use the Services for the purposes of monitoring their availability or functionality, or for any other competitive purposes.
                        </Text>
                        <Text style={{fontSize:16}}>2.6. The Operator shall do anything reasonably expected from it to ensure that the Texxano Application is available for the Client, function securely, reflect
                            the newest technological solutions and are comfortable to use. The Client understands and agrees that the Operator has the right to improve and enhance the
                            technical structure, security, availability, and functionality of the Texxano Application at any time. The Operator and Client may agree to the Special
                            Conditions on the criteria for the reliability, availability, and security of the Texxano Application.</Text>

                        <Text style={{fontSize:16}}>2.7. The Client takes into consideration and agrees that the Operator may:

                            • impose restrictions on the use of some parts or functionalities of the Texxano Application (for example, the necessary data capacity for the use of the Services, the speed of uploading the Contents, the volume of the Contents to be saved, etc.);
                            • suspend or terminate provision of the Texxano Application and close any of its parts. In the latter case, the Operator shall submit a notice to the Client to terminate the Contract under the terms and conditions stated in clause 10.2. of the Terms of Use.
                            • refuse to offer or provide access to the Texxano Application to any User.</Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}> 3. ENTRY INTO CONTRACT</Text>

                        <Text style={{fontSize:16}}>3.1. The Contract shall be deemed to be concluded when:

                            • the Client clicks on the button “Create site” on the Web Site or Login through the website or mobile application, thereby agreeing to the Terms
                            of Use and confirming that it has familiarized itself with the Privacy Policy; or • the Client and the Operator have signed the Contract document
                            that contains a reference to the Terms of Use and the Privacy Policy.
                        </Text>

                        <Text style={{fontSize:16}}>3.2. The Client shall thoroughly familiarize itself with the Terms of Use and the Privacy Policy before entry into the Contract, and,
                            upon the request of the Operator, confirm that they have done so. The Client shall ensure that its Users have also read through the
                            Terms of Use and the Privacy Policy thoroughly.</Text>

                        <Text style={{fontSize:16}}>3.3. Upon concluding the Contract, the Client or its representative shall verify that:
                            • all the data and confirmations that he/she/it has submitted or given are accurate, correct, complete and relevant;
                            • he/she/it is a person with full active legal capacity (at least 18 years old);
                            • he/she/it has all the rights and authorizations to enter into the Contract in the name of the Client, and use the Texxano Application.
                        </Text>

                        <Text style={{fontSize:16}}>3.4. The correctness of the above-mentioned authorizations is assumed and the Operator shall not be obligated to, but may, verify them.</Text>

                        <Text style={{fontSize:16}}>3.5. The Operator has the right to refuse to enter into the Contract with any person, even when the person has agreed to the Terms of Use.</Text>

                        <Text style={{fontSize:16}}>3.6. The Terms of Use and the Privacy Policy shall remain available for the Client and Users on the Web Site.</Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}> 4. TERMS AND CONDITIONS OF THE CONTRACT</Text>

                        <Text style={{fontSize:16}}>4.1. The Terms of Use are an inseparable part of the Contract. The Operator has the right to prescribe separate additional conditions on each Service (e.g. the Privacy Policy, price packages and instruction manuals) that are deemed to be an integral part of the Terms of Use.</Text>
                        <Text style={{fontSize:16}}>4.2. The Client and Operator may agree on Special Conditions in addition to the Terms of Use. The Special Conditions shall be submitted, at a minimum, in a format that can be reproduced in writing, and shall also be deemed an inseparable part of the Contract.</Text>
                        <Text style={{fontSize:16}}>4.3. The Operator shall communicate with the Client and the Users in English unless agreed otherwise. The Contract and other documentation on the provision of the Texxano Application and the Services are prepared in English. The Operator may make the translations of these documents available in other languages, in order to simplify understanding of the terms and conditions. In case of any discrepancies between the English language version and the translation, the English language text shall prevail.</Text>
                        <Text style={{fontSize:16}}>4.4. If a Client or a User does not agree with the Terms of Use or any changes thereto, he/she/it shall have no right to use the Texxano Application and the Services and such use must be terminated immediately.</Text>

                        <Text style={{fontSize:16}}>4.5. The Operator has the right to unilaterally change the Terms of Use at any time, by publishing the new wording of the Terms of Use, together with the changes made, on the Web Site. The Operator may change the Terms of Use in the following cases:
                            • a change in valid legal acts or the interpretation thereof;
                            • a court decision or administrative act that obligates the Operator to change the Terms of Use has entered into force;
                            • modification or termination of a provision of a current Service, or the introduction of a new Service;
                            • significant changes in the technical structure or functionality of the Texxano Application;
                            • suggestions and complaints from Clients and Users;
                            • a need to enhance data protection or other security measures;
                            • changes in the business model, work operation and/or authorizations of the Operator;
                            • technological developments that enable improvements to be made regarding usability, quality and security of the Texxano Application and the Services;
                            • other unforeseen circumstances under which amendment of the Terms of Use is reasonably justified or that could not have been considered by the Operator upon entry into force of the Terms of Use.
                        </Text>
                        <Text style={{fontSize:16}}>4.6. The Operator shall inform Clients of changes to the Terms of Use, on the Web Site and by a separate message to Clients’ contact details at least 14 days before their entry into force. If a Client does not agree with the changes, he/she/it shall have the right to terminate the Contract within the 14 days before the changes enter into force. If a Client continues using the Texxano Application after the above-mentioned 14-day dueDate has passed, he/she/it is deemed to have agreed with the changes to the Terms of Use.</Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}>5. CLIENT ACCOUNT AND USER ACCOUNT</Text>

                        <Text style={{fontSize:16}}>5.1. Client and User Accounts are necessary to use the main functionality of the Texxano Application. If a natural person
                            is related to several Clients, a separate User Account is created for that natural person under each Client Account.</Text>

                        <Text style={{fontSize:16}}>5.2. The User Accounts are administered by the Client, i.e. the Client has the right to create, change and deactivate
                            User Accounts at its own discretion and the information about the User. The Operator shall have the right and obligation
                            to create a new User Account only if the Client is unable to access its Client Account and no User is a legal representative
                            of the Client. A legal representative of the Client is a member of the management board on the Client’s registry card.</Text>

                        <Text style={{fontSize:16}}>5.3. Upon each log-in to the Texxano Application via its account, the User verifies that:
                            • all the data and confirmations that he/she/it has submitted or given are accurate, correct, complete and relevant;
                            • he/she/it is a person with full active legal capacity (at least 18 years old);
                            • he/she/it has all the rights and authorizations to use the Texxano Application in the name of the Client.
                        </Text>
                        <Text style={{fontSize:16}}>5.4. The correctness of the above-mentioned authorizations is assumed and the Operator shall not be obligated to, but may, verify them.</Text>

                        <Text style={{fontSize:16}}>5.5. Upon creation of an account, a Client and User shall choose an account name and password that enable them to log in to the Texxano Application.
                            The Client and Users shall keep their account name and password secret and prevent them from falling into the possession of third parties.
                            The Operator also facilitates Client log in to the Texxano Application via a unique Client or User link, in which case entering the account
                            name and password will not be necessary. Clients can activate this option under the settings of their Client Account.
                        </Text>

                        <Text style={{fontSize:16}}>5.6. A Client or User shall immediately notify the Operator:
                            • of abuse of its account;
                            • of the loss of its password or its falling into the possession of third parties;
                            • a change in their position, resignation or any other reason why the User no longer has the right to use the Texxano Application or Services in the name of the Client.
                        </Text>
                        <Text style={{fontSize:16}}>5.7. In the case stated in clause 5.6 of the Terms of Use, the Operator shall take all reasonable measures to renew the password, protect the account or delete it.</Text>

                        <Text style={{fontSize:16}}>5.8. Client and User Accounts shall be valid without a term until their deletion or termination of the Contract.
                            If a Client has requested that the Operator delete the Client Account, the Operator shall view it as termination of the Contract by the Client.
                        </Text>
                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}>6. FEES & PAYMENT</Text>

                        <Text style={{fontSize:16}}>6.1. The Operator has the right to prescribe fees for the use of the Texxano Application by publishing the respective price packages on the Web Site. The Client shall choose the most suitable price package from among them, in order to use the Texxano Application.</Text>

                        <Text style={{fontSize:16}}>6.2. The Client is obliged to remunerate the Operator for using the Texxano Application and the provided Services in accordance with the price package, add-ons and number of Client and User accounts selected by the Client.</Text>

                        <Text style={{fontSize:16}}>6.3. Before selecting a priced package, a first-time Client shall have the right to try out the standard solution of the Texxano Application free of charge for a trial period (14 days). The Operator shall not charge the Client for the trial period.</Text>

                        <Text style={{fontSize:16}}>6.4. If the Client wishes to continue using the Texxano Application under a price package after the end of the free trial period, it shall select a suitable package and make a prepayment for the next period by the end of the trial period at the latest.
                            If the Client has not done so, the Operator has the right to immediately close the Client Account and User Accounts upon the end of the trial period, incl. deleting
                            all the uploaded Contents, and automatically terminate the Contract. Unless agreed differently, the uploaded Contents in the trial version will be retained for 75 days from
                            after the trial period expired, in case the Client decides to continue using the Texxano Application under a price package.</Text>

                        <Text style={{fontSize:16}}>6.5. Payment under a price package shall take place on the principle of periodical prepayment, i.e. the Client pays in advance for each upcoming
                            period (usually one calendar month) for the use of the Texxano Application.</Text>

                        <Text style={{fontSize:16}}>6.6. Before the end of each payment period, the Client is issued an invoice or payment request.
                            The Client must make a payment by the due date indicated on the invoice or payment request.</Text>

                        <Text style={{fontSize:16}}>6.7. If the Client is paying by credit card, the Client authorizes the Operator to charge their credit card or bank account for all fees payable
                            for each payment period. The Client further authorizes the Operator to use a third party to process payments.
                        </Text>
                        <Text style={{fontSize:16}}>6.8. If the Client is paying by invoice, the Operator will issue an invoice at the beginning of each billing period.
                            All amounts invoiced are due and payable by the date marked on the invoice.
                        </Text>
                        <Text style={{fontSize:16}}>6.9. The Client can change its price package, activate add-ons and change the number of User
                            Accounts on the Texxano Application. The change of fee due to these changes shall be reflected on the prepayment
                            invoice issued to the Client for the next period. The possibilities of use enabled with the higher-priced packages shall
                            enter into force immediately after the Client confirms the change of the package. The changes to lower-price packages shall
                            enter into force at the beginning of the next period.
                        </Text>
                        <Text style={{fontSize:16}}>6.10. Already made prepayments will not be returned, including when:
                            • the Client has not used the Texxano Application during the prepaid period, or has only done so partially;
                            • the Client changes the Texxano Application price package;
                            • the Client terminates the Contract unilaterally, in accordance with the Terms of Use or under the law, without the Operator having breached the Contract;
                            • the Operator terminates the Contract unilaterally, in accordance with the Terms of Use or under the law.
                        </Text>

                        <Text style={{fontSize:16}}>6.11. If the Client fails to perform its obligation to pay for at least two weeks, the Operator has the right to restrict the Client’s access to the Texxano Application
                            and refuse to provide the Services. At that, the Operator has the right to calculate fees also for the period in which the abovementioned restrictions apply towards the Client.
                            The Operator shall notify the Client of implementation of the planned restrictions due to violation of the payment obligation to the Client’s email address at least twice,
                            with a minimum interval of 2 working days.</Text>

                        <Text style={{fontSize:16}}>6.12. All fees are exclusive of taxes, which the Operator will charge where applicable.</Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}> 7. CONTENTS. DATA PROCESSING AGREEMENT</Text>

                        <Text style={{fontSize:16}}>7.1. The Operator provides a Contents’ hosting and maintenance service to the Client via the Texxano Application. The Client decides if and what Contents,
                            including personal data, it wants to process on the Texxano Application. As such, the Operator processes any personal data in the Contents on behalf of the
                            Client solely for the purpose of providing the Texxano Application and acts as a data processor as regards such personal data, whereas the Client acts as a
                            data controller as regards such personal data.
                        </Text>
                        <Text style={{fontSize:16}}>7.2. Except for in the demo version (which should not contain any real, including personal data) or during the deployment, the Operator does not access
                            the Contents unless requested to do so by the Client (e.g. for customer support). The Users can only access the Contents that the Client has made available
                            to them on the Texxano Application.
                        </Text>
                        <Text style={{fontSize:16}}>7.3. The categories of data subjects the personal data of whom the Client may process in the Contents may include but not be limited
                            to: [identification data, contact data, employment data, communications data, data related to the use of the Texxano Application].
                            The categories of personal data the Client may process in the Contents may include but not be limited to: [identification data, contact data,
                            employment data, communications data, data related to the use of the Texxano Application].
                        </Text>

                        <Text style={{fontSize:16}}>7.4. The Client and the Operator wish to duly observe all their respective obligations under the Regulation (EU) 2016/679 of the European Parliament and of
                            the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data
                            (GDPR) and any other relevant applicable data protection regulations (together Data Protection Laws).
                        </Text>

                        <Text style={{fontSize:16}}>7.5. For the purposes of these Terms of Use, the terms “controller”, “processor”, “personal data”, “data subject”, “personal data breach” shall have
                            the meaning given in the GDPR. “Sub-processor” shall mean another processor engaged by the Operator to process the personal data in the Contents.
                        </Text>

                        <Text style={{fontSize:16}}>7.6. The Client as a data controller is fully responsible for any personal data in the Contents it processes using the Texxano Application.
                            The Client confirms that its personal data processing practices are fully compliant with the Data Protection Laws, including that it has a
                            legal basis to process the personal data in the Contents as stipulated herein and that it has properly informed the data subjects thereof.
                            If a User adds Contents to the Texxano Application, it shall ensure its accuracy, correctness, completeness, relevance and its
                            compliance with the Contract, good practice, and legal acts.
                        </Text>

                        <Text style={{fontSize:16}}>7.7. The Operator shall:
                            • process the personal data in the Contents only on lawful documented instructions from the Client and for the purposes of providing the Texxano Application, unless required to do so by the Data Protection Laws. In such case, the Operator shall inform the Client of such requirement in advance, unless that law prohibits providing such information;
                            • ensure that persons authorized to process the personal data in the Contents have committed themselves to confidentiality;
                            • taking into account the nature of processing and the information available to the Operator, assist the Client in ensuring compliance with the Client’s obligations under Articles 32 to 36 of the GDPR;
                            • inform the Client if, in the Operator’s opinion, the Client’s instruction infringes the Data Protection Laws.
                        </Text>

                        <Text style={{fontSize:16}}>7.8. The Operator takes appropriate technical and organizational security measures taking into account (i) the state of the art, (ii) costs of implementation,
                            (iii) nature, scope context and purposes of the processing, and (iv) risks posed to data subjects. Such security measures include, but are not limited to,
                            encrypted storage and access controls. In deciding on those measures, the Operator assumes that the Texxano Application is used for its intended purposes
                            (business management, project management, time management, work scheduling and tracking, financial management, reporting, etc.) which should not include
                            the processing of any special categories of personal data (see also section 7.3. above).
                        </Text>

                        <Text style={{fontSize:16}}>7.9. The Operator shall promptly notify the Client if it receives a request from a data subject in relation to its personal data in the Contents of the Client
                            and allows the Client to respond to it. The Operator shall not respond to a data subject request without the Client’s prior written consent.
                            Taking into account the nature of the processing, the Operator shall assist the Client by appropriate technical and organizational measures,
                            insofar as this is possible, for the fulfilment of Client’s obligation to respond to a data subject request under the Data Protection Laws.
                        </Text>

                        <Text style={{fontSize:16}}>7.10. The Client authorizes the Operator to use the following categories of sub-processors:
                            • hosting service providers;
                            • management and storage providers;
                            • email service providers;
                            • customer relationship management and feedback service providers;
                            • payment service providers.
                            • The full list of sub-processors is available upon request.

                            The Operator shall inform the Client of any intended changes concerning the addition or replacement of other categories of sub-processors. The Client may object to the Operator’s use of a new category of sub-processors by notifying the Operator promptly in writing within 10 working days after receipt of the Operator’s notice. In the event the Client objects to a new category of sub-processors, the Operator will use reasonable efforts to offer the Texxano Application to the Client without such category of sub-processors. If this is not possible, the Client may terminate the Contract. The Operator shall impose the same data protection obligations as set out herein on the sub-processors. Where a sub-processor fails to fulfil its data protection obligations, the Operator shall remain liable to the Client for the performance of the sub-processor’s obligations.
                        </Text>
                        <Text style={{fontSize:16}}>7.11. The Operator and its sub-processors may transfer personal data outside the EU only where they have a lawful basis to do so, including to a
                            recipient who is: (i) in a country which provides an adequate level of protection for personal data (in the US, this includes companies certifies
                            under the Privacy Shield); or (ii) under an instrument which covers the EU requirements for the transfer of personal data to data processors outside the EU.
                            More specific information about transferring personal data outside the EU is available upon request.
                        </Text>
                        <Text style={{fontSize:16}}>7.12. The Operator shall notify the Client without undue delay by email after it has become aware of a personal data breach and cooperate
                            reasonably with the Client as regards the data breach. In such case, the Client may use the information received from the Operator about the data
                            breach only to ensure and/or demonstrate its compliance with the Data Protection Laws. The Client shall keep this information confidential unless
                            it is the Client’s confidential information or unless such information must be disclosed under any applicable laws.
                        </Text>

                        <Text style={{fontSize:16}}>7.13. Upon the Client’s written request, the Operator shall make available to the Client the information necessary to demonstrate its compliance with the obligations laid down in this section herein and in Article 28 of the GDPR, provided the requested information is in the Operator’s possession or control. Should that prove to be insufficient for the Client, the Operator shall cooperate with the Client, including allow for and contribute to reasonable audits, including inspections, conducted by the Client or another auditor mandated by the Client and accepted by the Operator. The details of such audits and inspections shall be agreed between the Parties, however, the following applies:
                            • the Operator will only be required to provide to the Client information, records and documents reasonably required to demonstrate its compliance with its obligations under this section 7 and Article 28 of the GDPR regarding the personal data in the Contents;
                            • the Operator will not disclose any information, records or other documents that are subject to its business secrets;
                            • the Operator will not disclose any information, records or other documents that would place it in breach of its confidentiality obligations under applicable laws or agreements with other clients or persons;
                            • the Operator will not disclose any information, records or other documents relating to a matter that is subject to a current, pending or threatened litigation or other dispute resolution mechanism between the Client and the Operator;
                            • any information, records or other documents provided to the Client pursuant to this section 7 shall be treated as confidential by the Client;the Client may exercise its right to perform an audit under this section 7 not more often than once in any calendar year unless it has a reasonable doubt as to the compliance of the Operator.
                        </Text>
                        <Text style={{fontSize:16}}>7.14. Users may not add any Contents to the Texxano Application that contain viruses or other computer programs and files that damage or otherwise
                            disrupt the regular functioning of the Texxano Application, or which are stored in the computers of the Operator or User, and disrupt or damage
                            their normal functioning. The Client is responsible for ensuring it.
                        </Text>
                        <Text style={{fontSize:16}}>7.15. The Client gives the Operator the necessary rights to the Contents (including a non-exclusive license regarding any Contents protected under
                            intellectual property rights) and confirms that it has the right to do so.
                        </Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}>8. INTELLECTUAL PROPERTY</Text>

                        <Text style={{fontSize:16}}>8.1. The Texxano Application and any parts and elements thereof (including databases and software, business names, trademarks, business secrets,
                            domain names, etc.) are and may be protected under the intellectual property rights that belong to the Operator, its employees or cooperation partners.</Text>

                        <Text style={{fontSize:16}}>8.2. During the validity of the Contract, the Operator allows the Client and the Users to utilize the functionality of the Texxano Application for its
                            internal needs, in compliance with the Contract for the regular purpose for which the Texxano Application is intended. The Operator does not give the
                            Client or User any other licences or rights and the Client or the User shall not obtain intellectual property rights to the Texxano Application or the Web Site.
                        </Text>

                        <Text style={{fontSize:16}}>8.3. The User or Client may not change, copy, duplicate, distribute, process, translate, make extracts of, transmit, add to other databases
                            or make available to the public the Texxano Application, the Website or their parts, or use the intellectual property rights concerning the
                            Texxano Application in any other way without the prior written consent from the Operator. The Client and User also have no right to issue sublicenses
                            for the use of the Texxano Application or create new intellectual property objects based on them. The Texxano Application may not be sold, rented,
                            licenced, interfaced with a system of the Client or third parties, or used by any programmes that overload or interfere with the work of the Texxano
                            Application or distort the Contents, without the prior written consent from the Operator.
                        </Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}> 9. SUPPORT, MAINTENANCE AND DEVELOPMENT SERVICES</Text>

                        <Text style={{fontSize:16}}> 9.1. The Operator shall constantly renew the mechanisms that serve as the basis for the functioning of the Texxano Application in order to provide
                            high-quality Services to the Clients and Users. To achieve that objective, the Operator may change the Texxano Application and its components from time
                            to time, as well as change the requirements for the software and hardware required to use the Texxano Application provided via that Texxano Application.
                            The Operator shall notify Clients and Users of the most important changes within a reasonable timeframe before they enter into force, taking into account
                            the likely impact of the change on the Clients and Users.
                        </Text>
                        <Text style={{fontSize:16}}> 9.2. The Operator shall provide different helpful materials for the use of the Texxano Application, available at the Web Site.
                            In case there are any problems, questions or suggestions, the Clients and the Users can contact the Operator via the contacts indicated on the Web Site.
                        </Text>

                        <Text style={{fontSize:16}}> 9.3. If the Client uses the Texxano Application under a price package, the Operator shall ensure that the Client also receives the applicable
                            version upgrades and updates in the technical solution of the Texxano Application.
                        </Text>
                        <Text style={{fontSize:16}}> 9.4. The Operator has the right to temporarily restrict access to the Texxano Application if it is necessary for amending,
                            maintaining or updating of the Texxano Application, due to replacement, changing, or maintenance works done by third parties,
                            and other cases that emerge from the legal acts or decisions of competent authorities. The Operator shall inform the Clients and Users of the
                            planned maintenance works via the Texxano Application at least 2 working days in advance. In order to disrupt the use of the Texxano
                            Application as little as possible, the Operator shall perform regular maintenance and/or development works on working days from 18:00-07:00 (CET),
                            or on the weekends.
                        </Text>

                        <Text style={{fontSize:16}}> 9.5.If errors or any other functioning flaws are found in the Texxano Application that hinder the use of the Texxano Application, the Operator shall
                            do everything reasonably possible to eliminate these disturbances as soon as possible, but no later than 48 hours after receipt of the error message.
                            Should the functioning flaws be minor, the Operator may eliminate them later than 48 hours after receipt of the error message.However, in such case,
                            the Operator shall notify the Client.
                        </Text>
                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}>10. TERMINATION OF THE CONTRACT</Text>

                        <Text style={{fontSize:16}}>10.1.The Client has the right to cancel the Contract at any time unilaterally without cause by informing the Operator thereof by email.</Text>

                        <Text style={{fontSize:16}}>10.2.The Operator has the right to cancel the Contract unilaterally without cause by informing the Client thereof by email 30 days before
                            the planned date of termination of the Contract.In that case, the Contract shall be deemed terminated after 30 days have passed from submission
                            of the cancellation notice.
                        </Text>

                        <Text style={{fontSize:16}}>10.3.The Operator shall have the right to unilaterally cancel the Contract immediately, without prior notice, if:
                            • the Client has submitted false information about him/her/it;
                            • the Client has not used the Services continuously for at least a year;
                            • it becomes evident that the person who has used the Texxano Application or Client Account in the name of the Client has no right of representation to act on behalf of the Client;
                            • bankruptcy or rehabilitation of the Client has been declared, or compulsory dissolution or liquidation has been initiated against the Client;
                            • the Client causes the Operator damage, either intentionally or due to gross negligence;
                            • other grounds specified in the Contract.
                        </Text>
                        <Text style={{fontSize:16}}>10.4.Either Party has the right to cancel the Contract without notice if the other Party violates the terms of this Contract and has not eliminated
                            the violation within the additional reasonable period of time given.</Text>

                        <Text style={{fontSize:16}}>10.5.Upon termination of the Contract, the Operator shall close the respective accounts and, unless agreed differently, delete their Contents 75 days after
                            the Contract expired.The Operator shall not delete any Contents the retention of which is required under applicable laws.The Client can download a copy of
                            the Contents in a generally recognized format or, should the Client Account be unavailable for some reason, ask the Operator to transfer it, within 75 days
                            as of termination of the Contract.
                        </Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}>11. LEGAL REMEDIES OF THE OPERATOR</Text>

                        <Text style={{fontSize:16}}>11.1.The Operator is not obligated to check the Contents uploaded by Users onto the Texxano Application, nor User activities on the Texxano Application.
                            The Operator is also not obligated to monitor User activity, information or the Contents they add to or transfer via the Texxano Application, store in cache memory,
                            or save.At the same time, the Operator is obligated under the Information Society Services Act to inform competent supervisory agencies of possible illegal activity or of the information provided, and identify the Clients and Users to whom it is providing the service of data storage.
                        </Text>
                        <Text style={{fontSize:16}}> 11.2.If a Client or User breaches the Contract, the good practice of the Texxano Application, or the legislation, the Operator shall have the right to:
                            • eliminate the violation or unlawful Contents;
                            • request the elimination of the violation and require that the conduct or the Contents be brought into conformity with the Contract, good practice or legal acts;
                            • temporarily restrict the Client’s or User’s access to the Texxano Application or any of its parts, including close the User Account temporarily;
                            • restrict the rights of use of the Client or User.
                        </Text>
                        <Text style={{fontSize:16}}> 11.3.If the violation by the Client or User is repeated or material in some other way, the Operator has the right to: permanently forbid the Client or User
                            from using the respective part of the Texxano Application or the Services, delete the User Account, or terminate the Contract without notice.</Text>

                        <Text style={{fontSize:16}}>11.4.The Operator may restore the Contents that were removed from the Texxano Application due to a complaint or re-establish access to them if the
                            Operator is presented with convincing evidence of the compliance of the Contents to the Contract, good practice, or legal acts.</Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}>12. RESTRICTION OF LIABILITY</Text>

                        <Text style={{fontSize:16}}>12.1.The Operator provides the Texxano Application “as is”.In addition to what is clearly stated in the Terms of Use, the Operator does not give any additional
                            promises to the Client or enter into commitments as to the specific functions available via the Texxano Application, compliance with the law, usability for a
                            special purpose, reliability, availability and suitability for the Client’s needs, except when the Parties have agreed otherwise.
                        </Text>

                        <Text style={{fontSize:16}}> 12.2.To the extent permitted by applicable law, the Operator shall be liable only when it is culpable for its actions or omissions.The Operator’s total liability (including interest) for all claims connected with any violation of the Contract is limited to twice the fees payable under the Contract or the actual damages, whichever is the lesser.To the extent permitted by applicable law, the Operator shall not be liable before the Client or User for the loss of profit, pure economic damage, or non-patrimonial damage, as well as other indirect, special, consequential, warning or punishing damages.The Operator shall also not be responsible for the damage and other consequences that have arisen due to the following reasons:
                            • the Web Site or Information System do not function in some web browsers;
                            • disputes have arisen between a Client(s) and a User(s);
                            • validity, performance, and legality of the transaction made with third parties by the Client or User via the Texxano Application;
                            • adding of Contents to the Texxano Application by a Client or User, which is not in compliance with or not used in compliance with the Contract, good practice or legislation;
                            • processing (by a Client or User) of personal data added to the Texxano Application, if it is not in compliance with the applicable Data Protection Laws;
                            • management of the User Accounts by a Client, including violations of law or breaches of the Terms of Use performed through the Client or User Accounts, regardless of whether the person is authorized to use the Client or User Account;
                            • changes that have taken place in legal acts and their interpretation, their impacts on the business activity of the Clients or Users, and reflection of the respective changes in the Texxano Application, unless it is obligatory for the Operator under the legal acts or a court decision made regarding the Operator;
                            • force majeure and other faults and disturbances that the Operator cannot affect, which prevent the Client or the Users from using the Texxano Application, the Web Site and/or Services (e.g., interruptions in the internet connection, etc.); errors, damages or settings in the Client’s or the User’s devices that are inappropriate for the use of the Texxano Application or Web Site;
                            • delays, interruptions, or failures in the use of the Texxano Application, the Web Site and/or the Services due to planned maintenance and/or development works;
                            • processing of data by third parties to whom the Operator submitted the information with the consent of the Client or User, except for sub-processors processing the personal data in the Contents;
                            • if the Operator becomes aware of a violation of law that was performed using the Texxano Application or is still on-going, it shall eliminate it or restrict access to it, or take other active measures to end the violation of law or remove the consequences;
                            • the use of legal remedies by the Operator and the damage caused due to that to the Client, the User or a third party, even if it becomes evident later that there was no violation;
                            • loss of the Client or User Account password or their falling into the possession of third parties, or their use by third parties;
                            • failures and shortcomings in the systems of third parties (e.g.Outlook, Dropbox, MailChimp, etc.) that influence the functioning and/or availability of the Texxano Application and/or the Services.
                        </Text>
                        <Text style={{fontSize:16}}>12.3.The Client shall defend, indemnify and hold the Operator harmless from and against any liabilities, allegations, claims, actions, suits, demands,
                            damages, obligations, losses, settlements, judgments, costs and expenses (including without limitation attorneys’ fees and costs), including to third parties,
                            data subjects and any administrative sanctions and penalties imposed by any national or international authority or court, due to the Client’s infringement or
                            breach (intentional or negligent) of its obligations as a data controller under this Contract or any Data Protection Laws.
                        </Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}>13. APPLICABLE LAW AND SETTLEMENT OF DISPUTES</Text>

                        <Text style={{fontSize:16}}>13.1.This Contract is governed by the laws of the Republic of North Macedonia.</Text>

                        <Text style={{fontSize:16}}>13.2.If the Client is not satisfied with the activities of the Operator, it has the right to file a complaint to the Operator.
                            The Operator shall make efforts to settle the disputes by means of negotiations.Other contractual disputes between a
                            Client and the Operator shall also be sought to be settled by negotiations.
                        </Text>

                        <Text style={{fontSize:16}}>13.3.If the settlement of a complaint or other disputes by negotiation fails, it shall be resolved in Skopje Civil Court in Skopje, Republic of North Macedonia.</Text>

                        <Text style={{ fontSize: 19, paddingVertical: 10, fontWeight: '600' }}>Terms of Use valid from 13.10.2021</Text>

                    </View>
                </View>
            </ScrollView>


        </AppContainerClean >
    )
}

export default Privacy
