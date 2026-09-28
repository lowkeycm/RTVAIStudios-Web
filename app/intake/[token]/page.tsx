import {Intake} from '@/components/rtv/forms';
export const metadata={title:'Your creative brief',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{token:string}>}){return <Intake token={(await params).token}/>}
