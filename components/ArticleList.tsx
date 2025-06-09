import styles from './ArticleList.module.css'

export default function ArticleList({ articles }: { articles: any[] }) {
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {articles.map((article) => (
          <div key={article._id} className={styles.card}>
            <h2 className={styles.title}>{article.title}</h2>
            <p className={styles.summary}>{article.summary}</p>
            <img
              src={article.image?.asset?.url}
              alt={article.title}
              className={styles.image}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
