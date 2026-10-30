import {Composition, staticFile, type CalculateMetadataFunction} from 'remotion';
import {MotionVideo} from './Video';
import type {Project} from './types';
import {validId, validateProject} from '../lib/project.mjs';

export type VideoProps = {projectId:string; project?:Project};
const metadata: CalculateMetadataFunction<VideoProps> = async ({props,abortSignal}) => {
  validId(props.projectId);
  const response = await fetch(staticFile(`projects/${props.projectId}/project.json`), {signal:abortSignal});
  if (!response.ok) throw new Error('Projeto nao encontrado. Execute npm run demo ou npm run ingest.');
  const project = validateProject(await response.json()) as Project;
  return {width:project.width,height:project.height,fps:project.fps,durationInFrames:Math.ceil(project.durationMs/1000*project.fps),props:{...props,project}};
};
export const RemotionRoot = () => <Composition id="AudioMotion" component={MotionVideo} defaultProps={{projectId:'demo'}} durationInFrames={360} fps={30} width={1920} height={1080} calculateMetadata={metadata}/>;
