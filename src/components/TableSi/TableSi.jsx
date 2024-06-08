import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import styles from "./tableSi.module.scss";
import { Button, IconButton, Radio } from "@mui/material";
import { RadioButtonCheckedRounded, Delete } from "@mui/icons-material";
import Modal from "../Modal/Modal";
import DeleteModalContent from "../Modal/DeleteModalContent/DeleteModalContent";
import axios from "../../axios";
import { toast } from "react-toastify";

export default function DataTable(props) {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState();
  const [showModal, setShowModal] = React.useState(false);
  const [activeQuestion, setActiveQuestion] = React.useState();

  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const onDeleteQuestion = (id) => {
    openModal();
    setActiveQuestion(id);
  };

  const onConfirmDelete = async () => {
    closeModal();
    try {
      const res = await axios.delete(`/question/${activeQuestion}`);
      console.log(res.data);
      toast.success("Question deleted successfully");
      await fetchQuestions();
    } catch (error) {
      console.log(error);
    }
  };

  const renderColorStatus = (status) => {
    let color = { backgroundColor: "black" };
    if (status === "g") {
      color = { backgroundColor: "green" };
    } else if (status === "y") {
      color = { backgroundColor: "yellow" };
    } else if (status === "r") {
      color = { backgroundColor: "red" };
    }
    return color;
  };
  // const handleOpenLink =async (event, id) => {
  //   event.preventDefault();
  //   const url = `http://localhost:4000/api/createObject/${id}`;
  //   const response = await fetch(url);
  //   const responseData = await response.text();
  //   window.open(responseData, '_blank')
  // };
  const columns = [
    {
      field: "col0",
      headerName: "",
      width: 70,
      renderCell: (params) => (
        <Radio
          checked={params.id == selectedRowId}
          value={params.id}
          onChange={(e) => {
            console.log(e.target.value);
            setSelectedRowId(e.target.value);
          }}
        />
      ),
    },
    
    {
      field: "name",
      headerName: "Title",
      width: 200,
      renderCell: (params) => {
        return <Link to={`/show/${params.id}`}>{params.row.name}</Link>;
      },
    },
    {
      field: "type",
      headerName: "Type",
      width: 200,
    },
    {
      field: "domain",
      headerName: "Domain",
      width: 200,
    },
    {
      field: "subDomain",
      headerName: "Sub Domain",
      width: 200,
    },
    {
      field: "dateModified",
      headerName: "Date Modified",
      width: 150,
    },
    {
      field: "hasAnswered",
      headerName: "Has Answered",
      width: 150,
      renderCell: (params) => {
        return (
          <div
            className={styles["circular-status"]}
            style={renderColorStatus(params.row.hasAnswered)}
          ></div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => {
        return (
          <IconButton
            aria-label="delete"
            color="error"
            onClick={() => onDeleteQuestion(params.id)}
          >
            <Delete />
          </IconButton>
        );
      },
    },
  ];

  const fetchQuestions = React.useCallback(async () => {
    setLoading(true);
    const res = await axios.get(`/interactive-objects`);
    const data = res.data;
    if (!!data.docs.length) {
      setRows(
        data.docs.map((item) => ({
          id: item._id,
          name: item.questionName,
          type: item.type,
          domain: item.domainName,
          subDomain: item.subDomainName,
          dateModified: new Date(item.createdAt).toLocaleDateString("en-GB"),
          hasAnswered: item.isAnswered,
        }))
      );
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const onClickAddQuestion = () => {
    navigate("/add-question");
  };

  const onClickEditQuestion = () => {
    // Check if a row is selected
    if (selectedRowId) {
      // Redirect to the previous page with the selected question ID
      navigate(`/show/${selectedRowId}`);
      navigate(`/edit_SI/${selectedRowId}`)
    } else {
      // If no row is selected, show a toast or alert indicating that a question must be selected
      toast.error("Please select a question before proceeding.");
    }
  };
  
  return (
    <>
      <Modal show={showModal} handleClose={closeModal}>
        <DeleteModalContent
          handleClose={closeModal}
          onDelete={onConfirmDelete}
        />
      </Modal>
      <div className={styles.table}>
        <div className={styles.actions}>
          {/* <Button variant="contained" onClick={onClickAddQuestion}>
            Add Question
          </Button> */}
          <Button variant="contained" onClick={onClickEditQuestion}>
            Select
          </Button>
        </div>
        <DataGrid
          loading={loading}
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          baseCheckbox={RadioButtonCheckedRounded}
          slots={{ toolbar: GridToolbar }}
        />
      </div>
    </>
  );
}