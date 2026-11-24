import type { CSSProperties } from 'react'
import { copy, githubProfile, projects } from '../content'
import { ActionLink, Chip } from '../sakuga'
import { Scene } from '../Scene'
import { sceneArt } from '../scene-art'
import { Icon } from '../Icon'
import { ChapterHeading } from '../ChapterHeading'
import { Dossier } from './Dossier'
import { ProjectIllustration } from './ProjectIllustration'

export function Work({ tooltips }: { tooltips: boolean }) {
  const comicBackground = { '--studio-art': `url("${sceneArt.workBackdrop}")` } as CSSProperties
  return <Scene id="work" className="site-section work-section">
    <div className="frame studio-stage">
      <ChapterHeading chapter={copy.work} id="work-title" />
      <div className="studio-screen" style={comicBackground}><div className="project-grid">
        {projects.map(project => <article className={`project panel ${project.span}`} key={project.id} data-project={project.id}>
          <div className="project-page">
            <div className="project-caption">
              <div className="panel-top"><span>{project.badge}</span><b>{project.index}</b></div>
              <h3>{project.title}</h3><p>{project.description}</p>
            </div>
            <ProjectIllustration project={project.id} />
            <div className="project-details">
              <div className={'project-preview ' + project.id}>
                {project.preview.map(item => <div key={item}>{item}</div>)}
              </div>
              {project.stack.length > 0 && <ul className="chips" aria-label={copy.technologies}>{project.stack.map(item => <li key={item}><Chip title={item} hint={project.title} enhanced={tooltips} /></li>)}</ul>}
              {(project.dossier || project.demo || project.repo) && <div className="action-row">
                {project.dossier && <Dossier project={project} dossier={project.dossier} />}
                {project.demo && <ActionLink href={project.demo} appearance="pink"><Icon name="launch" />{copy.demo}<span className="sr-only"> · {project.title}</span></ActionLink>}
                {project.repo && <a className="comic-action" href={project.repo}><Icon name="code" />{copy.github}<span className="sr-only"> · {project.title}</span></a>}
              </div>}
            </div>
          </div>
        </article>)}
        <div className="studio-final"><a className="comic-action pink" href={githubProfile.href}>{copy.allWork}<Icon name="arrow_outward" /></a></div>
      </div></div>
      <div className="studio-dots" role="group" aria-label={copy.chooseProject}>
        {[...projects.map(project => project.title), copy.allWork].map((name, index) =>
          <button type="button" data-beat={index} aria-label={name} key={name} />)}
      </div>
    </div>
  </Scene>
}
