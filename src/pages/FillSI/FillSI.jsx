import React, { useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  Box,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Modal,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { Delete, ExpandLess, ExpandMore } from "@mui/icons-material";
import "react-quill/dist/quill.snow.css";
import "../../App.css";
import styles from "./fillSI.module.scss";
import { v4 as uuidv4 } from "uuid";
import axios from "../../axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";
import ReactQuill from "react-quill";
import AddQuestionSi from "../../pages/AddObjectSi/AddObjectSi"; // Import the component

const generateFillBlankQuestion = () => {
  return {
    paragraph: "",
    _Object_: "",
  };
};

const FillSIForm = (props) => {
  const [slides, setSlides] = useState(
    JSON.parse(localStorage.getItem("mySlides")) || [generateFillBlankQuestion()]
  );
  const [showResult, setShowResult] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(null);
  const handleOpenModal = (index) => {
    setCurrentSlideIndex(index);
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [result, setResult] = useState(null);
  const location = useLocation();
  const params = useParams();
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const { data: state } = useStore();
  const navigate = useNavigate();
  const [renderFromModal, setRenderFromModal] = useState(false);

  useEffect(() => {
    const savedHtmlContent = localStorage.getItem("htmlContent");
    if (savedHtmlContent) setHtmlContent(savedHtmlContent);
    getQuestionTypes();
    handleShowResult();
  }, []);

  useEffect(() => {
    localStorage.setItem("htmlContent", htmlContent);
  }, [htmlContent]);

  useEffect(() => {
    localStorage.setItem("mySlides", JSON.stringify(slides));
  }, [slides]);

  const handleEditQuestionParam = (param, value, questionIndex) => {
    setSlides((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex][param] = value;
      return updatedQuestions;
    });
  };

  const [selectedOption, setSelectedOption] = useState("");
  const [types, setTypes] = useState([]);
  const handleHtmlChange = (html, index) => {
    setSlides((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index].paragraph = html;
      return updatedQuestions;
    });
  };

  const handleShowResult = async () => {
    try {
      const { id } = params;
      if (!id) {
        console.error("Error: No id found in params");
        return;
      }

      const res = await axios.get(`/interactive-objects/${id}`);
      const { parameters } = res.data;

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
  };

  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const SelectFromLibrary = () => {
    navigate("/HomeSi");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      ...state,
      isAnswered: "g",
      parameters: { slides },
    };
    try {
      setLoading(true);
      if (location.pathname.includes("/edit_fill/")) {
        const { id } = params;
        await axios.patch(`/interactive-objects/${id}`, { ...data });
        toast.success("Question updated successfully!");
        setTimeout(() => navigate("/"), 2000);
      } else {
        const { id } = params;
        const updatedSlides = slides.map((slide) => ({
          ...slide,
          _Object_: id,
          paragraph: slide.paragraph,
        }));
        await axios.post("/interactive-objects", {
          ...state,
          isAnswered: "g",
          type: "SI",
          parameters: { slides: updatedSlides },
        });
        if (props.onSubmit) props.onSubmit();
        else {
          toast.success("Question created successfully!");
          setTimeout(() => setShowForm(false), 2000);
        }
      }
      const { id } = params;
      navigate(`/fill_blank/${id}`, { state: { fromSI: true } });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const slideId = uuidv4();
    const initialSlide = {
      id: slideId,
      paragraph: htmlContent,
      _Object_: params.id,
    };
    setSlides((prevSlides) => [...prevSlides, initialSlide]);
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
      updatedQuestions[questionIndex].open =
        !updatedQuestions[questionIndex].open;
      return updatedQuestions;
    });
  };

  const handleDeleteObject = (questionIndex) => {
    setSlides((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex]._Object_ = "";
      return updatedQuestions;
    });
    setShowResult(false);
    setHtmlContent("");
    setResult(null);
    setShowForm(true);
    setLoading(false);
    navigate("/SI-page");
  };

  const styleSheet = {
    form: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
  };

  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    height: "auto",
    maxHeight: "70vh",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "auto",
  };

  return showForm ? (
    <form className="container" onSubmit={handleSubmit}>
      {!renderFromModal && (
        <>
          <List
            sx={{ width: "100%", bgcolor: "background.paper" }}
            component="nav"
          >
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
                    <Button
                      type="button"
                      className="save-button"
                      onClick={() => handleOpenModal(idx)}
                    >
                      Add Object
                    </Button>
                    <Button
                      type="button"
                      className="cancel-button"
                      onClick={SelectFromLibrary}
                    >
                      Select From Library
                    </Button>
                    <Button
                      type="button"
                      className="show-button"
                      onClick={() => handleDeleteObject(idx)}
                      style={{ color: "red" }}
                    >
                      Delete
                    </Button>
                    <>
                      <div className="header-container">
                        <div className="" style={styleSheet.form}>
                          <div className={styles.contentContainer}>
                            <header className="app-header-Fill">
                              <h1>The Object</h1>
                            </header>
                            <div className={styles.verticalSpace} />
                            <div className="quill-editor-container">
                              <ReactQuill
                                theme="snow"
                                value={question.paragraph}
                                onChange={(html) => handleHtmlChange(html, idx)}
                              />
                            </div>
                          </div>
                        </div>
                        <header className="app-header2">
                          <h2>Description</h2>
                        </header>
                      </div>
                      <div className={styles["image-box"]}>
                        <img
                          src="/assets/question-bg-2.jpg"
                          alt="question background"
                        />
                      </div>
                      {showResult && result && (
                        <div className={styles["result-container"]}>
                          <iframe
                            src={result}
                            title="Result"
                            className={styles["iframe-container"]}
                          />
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

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{ ...modalStyle }}>
          <Typography id="modal-title" variant="h6" component="h2">
            Add or Select Object
          </Typography>
          <AddQuestionSi /> {/* Render AddObjectSi component directly */}
          <Button onClick={handleOpenModal}>Add object</Button>
          <Button onClick={SelectFromLibrary}>Select From Library</Button>
          <Button onClick={handleCloseModal}>Close</Button>
        </Box>
      </Modal>
    </form>
  ) : (
    <div className="container"></div>
  );
};

export default FillSIForm;
