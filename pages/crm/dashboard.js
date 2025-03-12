import CrmLayout from "@/components/layouts/CrmLayout";

export default function DashboardPage() {
  return (
    <CrmLayout>
      <h1>Дашборд</h1>
    </CrmLayout>
  );
}
export const getServerSideProps = async (props) => {
  return {
    props: {},
  };
};
