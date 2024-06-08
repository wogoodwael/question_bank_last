import React from "react";
import  { useState } from 'react';
import '../../App.css';
import 'react-quill/dist/quill.snow.css';
import styles from "./fillSI.module.scss";
import { Button, CircularProgress } from "@mui/material";
import ReactQuill from 'react-quill';

import { v4 as uuidv4 } from "uuid";
import axios from "../../axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";
import {
  Box,


  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { Delete, ExpandLess, ExpandMore } from "@mui/icons-material";
const generateFillBlankQuestion = () => {
  return {
    paragraph: "",
    _Object_: "", 
 
  };
};

const FillSIForm = (props) => {
  

  const [slides, setSlides] = React.useState([
    generateFillBlankQuestion(),
  ]);
  const [showResult, setShowResult] = useState(false);
  const [htmlContent, setHtmlContent] = useState(""); // State to store HTML content
  const handleHtmlChange = (html) => {
    setHtmlContent(html);
  };
  const [result2, setResult2] = useState("");

  const [result, setResult] = useState(null);
  const location = useLocation();
  const params = useParams();
  const [showForm, setShowForm] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { data: state } = useStore();
  const navigate = useNavigate();
  const [renderFromModal, setRenderFromModal] = React.useState(false);

  const fetchData = async (id) => {
    try {
      const res = await axios.get(`/interactive-objects/${id}`);
      console.log(res.data);
      const { parameters } = res.data;
      if (parameters && parameters.slides) {
        setSlides(parameters.slides);}
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  React.useEffect(() => {
    const savedHtmlContent = localStorage.getItem("htmlContent");
    if (savedHtmlContent) {
      setHtmlContent(savedHtmlContent);
    }
    getQuestionTypes()
    // Edit
 handleShowResult()
   
  }, []);
  React.useEffect(() => {
    // Save HTML content to local storage whenever it changes
    localStorage.setItem("htmlContent", htmlContent);
  }, [htmlContent]); // Runs whenever htmlContent changes

  const handleEditQuestionParam = (param, value, questionIndex) => {
    setSlides((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex][param] = value;
      return updatedQuestions;
    });
  };
  
  const [selectedOption, setSelectedOption] = useState(""); 
  const [types, setTypes] = React.useState([]);
  const handleShowResult = async () => {
    try {
      const { id } = params;
  
      // Check if the id exists
      if (!id) {
        console.error("Error: No id found in params");
        return; // Skip fetching data
      }
  
      const res = await axios.get(`/interactive-objects/${id}`);
      console.log(res.data);
      const { parameters } = res.data;
      console.log("ID", id);
      // console.log("ID2", parameters.slides[0]._Object_);
      if (location.pathname.includes("/edit_SI_edit/")) {
        const { data } = await axios.get(
          `https://questions-api-osxg.onrender.com/api/createObject/${parameters.slides[0]._Object_}`
        );
        setResult(data);
        setShowResult(true);
      } else if (location.pathname.includes("/edit_SI/")) {
        const { id } = params;
        const { data } = await axios.get(
          `https://questions-api-osxg.onrender.com/api/createObject/${id}`
        );
        setResult(data);
        setShowResult(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  

  
  
  const getQuestionTypes = async () => {
    const res = await axios.get("interactive-object-types");
    const types = res.data.map((item) => item.typeName);
    setTypes(types);
  };// State variable to track selected option
  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
    AddObject()
  };
  const AddObject = () => {
 navigate("/add-question")
  };
  
  const SelectFromLibrary = () => {
  navigate("/HomeSi");

  };




  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log(state);
    const data = {
      ...state,
      isAnswered: "g",
      parameters: { slides },
    };
    console.log(data);
    try {
      setLoading(true);
      if (location.pathname.includes("/edit_fill/")) {
        const { id } = params;
        await axios.patch(`/interactive-objects/${id}`, {
          ...data,
        });
        toast.success("Question updated successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        const { id } = params;
        const updatedSlides = slides.map(slide => ({
          ...slide,
          _Object_: id, 
          paragraph:htmlContent
        }));
        await axios.post("/interactive-objects", {
          ...state,
          isAnswered: "g",       // g, y , r
            type:'SI',
          parameters: {slides: updatedSlides},
        });
        if (props.onSubmit) {
          props.onSubmit();
        } else {
          toast.success("Question created successfully!");
          setTimeout(() => {
            setShowForm(false);
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
    setSlides((prevQuestions) => [...prevQuestions, generateFillBlankQuestion()]);
  };

  const handleDeleteQuestion = (questionIndex) => {
    if (slides.length <= 1) return;
    setSlides((prevQuestions) =>
      prevQuestions.filter((_, index) => index !== questionIndex)
    );
  };

  const handleOpenQuestion = (questionIndex) => {
    setSlides((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex].open = !updatedQuestions[questionIndex].open;
      return updatedQuestions;
    });
  };
  const handleDeletObject=(questionIndex)=>{
 

    // Reset other state variables to their initial values
    setShowResult(false); // Hide the result
    setHtmlContent(""); // Clear HTML content
    setResult(null); // Clear result
    setShowForm(true); // Reset showForm to true
    setLoading(false); // Reset loading to false

    // Optionally, you can also reset other state variables to their initial values here

    // You can also navigate to a specific page if needed
    navigate("/SI-page");
  }

  const styleSheet = {
    form: {
      display: 'flex', // Use flexbox to align components side by side
      justifyContent: 'space-between', // Space between the two components
      alignItems: 'flex-start', // Align items to the top
    },
  };

  return showForm ? (
    <form className="container" onSubmit={handleSubmit}>
      {!renderFromModal && (
        <>
            <QuestionNameHeader>Smart Interactive object</QuestionNameHeader>
            <List sx={{ width: "100%", bgcolor: "background.paper" }} component="nav">
        {slides?.map((question, idx) => (
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
                <ListItemText primary={`Slide ${idx + 1}`} />
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
             
          <button className="save-button" onClick={AddObject}>Add Object </button>
          <button className="cancel-button" onClick={SelectFromLibrary}>Select From library</button>
          <Button className="show-button" onClick={handleDeletObject} style={{ color: 'red' }}>Delete</Button>
          <>
            <div className="header-container">
              <div className="" style={styleSheet.form}>
                <div className={styles.contentContainer}>
                  <header className="app-header-Fill">
                    <h1>The Object </h1>
                  </header>
                  <div className={styles.verticalSpace} />
          
                  <div className="quill-editor-container">
                  <ReactQuill
        theme="snow"
        value={htmlContent}
        onChange={handleHtmlChange}
      />
      </div>
                </div>
              </div>
              <header className="app-header2">
                <h2>Description</h2>
              </header>
            </div>
            <div className={styles["image-box"]}>
              <img src="/assets/question-bg-2.jpg" alt="question background" />
            </div>
            {showResult && result && (
              <div className={styles["result-container"]}>
               
                <iframe src={result} title="Result" className={styles["iframe-container"]} />
              </div>
            )}
          </>
       
              </Box>
            </Collapse>
          </Box>
        ))}
      </List>
  <Button
          size="large"
          onClick={handleAddQuestion}
          startIcon={<AddIcon />}
        >
          Add Slide
        </Button>
        </>
      )}
      
      {/* {selectedOption === "FillTheBlank" && (
        <List
          sx={{ width: "60%", bgcolor: "background.paper" }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
        {questions.map((question, idx) => (
          <Box key={question.id} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2}>
              <ListItemButton
                onClick={() => handleOpenQuestion(question.id)}
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
                onClick={() => handleDeleteQuestion(question.id)}
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
        question={parameters}
        handleEditQuestionParam={handleEditQuestionParam}
        renderFromModal={renderFromModal}
      />
              </Box>
            </Collapse>
          </Box>
        ))}
        
      </List>
        )}
      <Button   //*deited
        size="large"
        sx={{ fontWeight: "bold" }}
        onClick={handleAddQuestion}
      >
        Add Sentence   
      </Button>
      {/* <QuestionForm
        question={parameters}
        handleEditQuestionParam={handleEditQuestionParam}
        renderFromModal={renderFromModal}
      /> */}
       
      <div className={styles["submit-box2"]}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          <span>Submit</span>
          {loading && <CircularProgress />}
        </Button>
      </div>
    </form>
  ) : (
    <div className="container">
      
    </div>
  );
};

export default FillSIForm;
