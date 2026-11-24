type Chapter = { chapter: string; stamp: string; title: string; accent: string; intro?: string }

export function ChapterHeading({ chapter, id }: { chapter: Chapter; id: string }) {
  return <div className="chapter-heading">
    <div><div className="chapter-pill"><span>{chapter.chapter}</span><b>{chapter.stamp}</b></div>
      <h2 id={id}>{chapter.title} <em>{chapter.accent}</em></h2>
    </div>
    {chapter.intro && <p>{chapter.intro}</p>}
  </div>
}
