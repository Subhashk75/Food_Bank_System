import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import { Flex, Box, useColorModeValue } from "@chakra-ui/react";
import DistributionReport from "../hooks/DistributionReportH";
import Auth from "../components/utils/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function ReportDistPage() {
  const bg = useColorModeValue("white", "gray.800");
  const navigate = useNavigate();

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1">
        <Box width={{ base: "0", md: "250px" }}>
          <Sidebar />
        </Box>
        <Box 
          flex="1" 
          p={4} 
          bg={bg}
          overflowY="auto"
        >
          <DistributionReport />
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default ReportDistPage;