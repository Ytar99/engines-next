import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/catalog");
}

// export default function Home() {
// return (

//   <div className={styles.page}>
//     <Link className="btn" href="/admin">
//       Админка
//     </Link>
//   </div>
// );
// }
