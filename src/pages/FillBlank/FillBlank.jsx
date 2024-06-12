import React, { useState, useEffect } from "react";
import { Button, CircularProgress, List } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import axios from "../../axios";
import QuestionForm from "../../components/FillBlank/QuestionForm/QuestionForm";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import { grey } from "@mui/material/colors";
import { Delete, ExpandLess, ExpandMore } from "@mui/icons-material";
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";
import styles from "./fillBlank.module.scss";
import {
  Box,
  Collapse,
  IconButton,

  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
const generateFillBlankQuestion = () => {
  return {
    _Question_: "",
    _Answer_: "", 
    _Tip_: "",
   
  };
};

const FillBlankForm = (props) => {
  const [questions, setQuestions] = useState([generateFillBlankQuestion()]);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(null); // State to hold the id

  const { data: state } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const fetchData = async (id) => {
    try {
      const res = await axios.get(`/interactive-objects/${id}`);
      console.log(res.data);
      const { parameters } = res.data;
      setQuestions(parameters.questions);
      setId(id); // Set the id state

     
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (location.pathname.includes("/edit_fill/")) {
      const { id } = params;
      fetchData(id);// Set the id state
    }
  }, []);

  const handleEditQuestionParam = (param, value, questionIndex) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex][param] = value;
      return updatedQuestions;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const containsEmptyAnswer = questions.some(question => question._Answer_ === '');
    setLoading(true);
    try {
      const data = {
        ...state,
        isAnswered: containsEmptyAnswer ? "r" : "g",
        parameters: { questions },
      };
  
      if (location.pathname.includes("/edit_fill/")) {
        const { id } = params;
        await axios.patch(`/interactive-objects/${id}`, data);
        toast.success("Question updated successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        const response = await axios.post("/interactive-objects", data);
        const newId = response.data;
        setId(newId);
        if (props.onSubmit) {
          props.onSubmit();
        } else {
          toast.success("Question created successfully!");
          setTimeout(() => {
            setQuestions([generateFillBlankQuestion()]);
            if (location.pathname.includes("/add-question-si/filltheblanks/manual")) {
              navigate(`/edit_SI/${newId}`);
            } else {
              navigate(`/`);
            }
          }, 2000);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddQuestion = () => {
    setQuestions((prevQuestions) => [...prevQuestions, generateFillBlankQuestion()]);
  };

  const handleDeleteQuestion = (questionIndex) => {
    if (questions.length <= 1) return;
    setQuestions((prevQuestions) =>
      prevQuestions.filter((_, index) => index !== questionIndex)
    );
  };

  const handleOpenQuestion = (questionIndex) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex].open = !updatedQuestions[questionIndex].open;
      return updatedQuestions;
    });
  };

  return (
    <>
       <QuestionNameHeader>FillTheBlank</QuestionNameHeader>
       <div className={styles["image-box"]}>
    <img src="/assets/question-bg-2.jpg" alt="question background" />
  </div>
    <form onSubmit={handleSubmit}>
      <List sx={{ width: "100%", bgcolor: "background.paper" }} component="nav">
        {questions.map((question, idx) => (
          <Box key={idx} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2}>
              <ListItemButton
                onClick={() => handleOpenQuestion(idx)}
                sx={
                  question.open
                    ? { backgroundColor: grey[300] }
                    : { backgroundColor: grey[200] }
                }
              >
                <ListItemText primary={`Question ${idx + 1}`} />
                {question.open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <IconButton
                aria-label="delete"
                sx={{ width: "3rem", height: "3rem" }}
                color="error"
                onClick={() => handleDeleteQuestion(idx)}
              >
                <Delete />
              </IconButton>
            </Stack>
            <Collapse
              in={question.open}
              timeout="auto"
              unmountOnExit
              sx={{
                border: `1px solid ${grey[300]}`,
                borderTop: 0,
                mb: 2,
                p: 2,
                borderRadius: "0 0 .5rem .5rem",
                width: "95%",
              }}
            >
              <Box>
                <QuestionForm
                  question={question}
                  handleEditQuestionParam={(param, value) =>
                    handleEditQuestionParam(param, value, idx)
                  }
                />
              </Box>
            </Collapse>
          </Box>
        ))}
      </List>
      <div className={styles.bottomButtonsContainer}>
        <Button
          size="large"
          onClick={handleAddQuestion}
          startIcon={<AddIcon />}
        >
          Add Sentence
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          <span>Submit</span>
          {loading && <CircularProgress />}
        </Button>
        {/* <button className="back-to-si" onClick={handleSubmitToSI}>SI</button> */}

      </div>
    </form>
    </>
  );
};

export default FillBlankForm;
