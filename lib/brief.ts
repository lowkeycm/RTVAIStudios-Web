export const briefSteps = [
 {title:'The idea',description:'Start with what you want the video to do.',fields:[['goal','What do you want this content to accomplish? *'],['audience','Who are we speaking to, and what should they do next? *'],['channels','Where will this run?']]},
 {title:'Your brand',description:'Help us understand who you are and how you sound.',fields:[['brand','How should your brand sound and feel?'],['knownFor','What do you want to be known for?'],['customerWords','How do customers describe or recommend you?'],['references','Brand guidelines, reference links, and past work']]},
 {title:'Your world',description:'Share the context and inspiration behind your idea.',fields:[['competitors','Who else is in your space?'],['series','For a series: who or what should the stories revolve around?']]},
 {title:'The practical details',description:'A rough estimate is fine. We can work out the details together.',fields:[['quantity','How much content do you have in mind?'],['budget','What budget are you working with? Please say whether it’s per project or per month.'],['deadline','Any deadline or launch date?'],['relationship','One project, ongoing content, or both?']]},
 {title:'The finish line',description:'Tell us what a great result looks like.',fields:[['success','What would a successful project look like? *'],['approvers','Who will approve the creative and final videos?'],['other','Anything else we should know?'],['heard','How did you hear about RTV?']]},
];
export const briefKeys = new Set(briefSteps.flatMap(step=>step.fields.map(([key])=>key)));
export function firstMissingBriefStep(answers:Record<string,string>){return briefSteps.findIndex(step=>step.fields.some(([key,label])=>label.endsWith('*')&&!answers[key]?.trim()));}
