import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { useForm } from "react-hook-form";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ScannerIcon from "@mui/icons-material/Scanner";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { Button } from "@mui/material";
import {
  ownerList,
  domainList,
  languageList,
  subDomainList,
  getDomainName,
  getSubDomainName,
} from "../../config";
import axios from "../../axios";
import { toast } from "react-toastify";

import styles from "./addObject.module.scss";

const AddObject = () => {
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();
  const { setFormState } = useStore();
  const [types, setTypes] = useState([]);
  const [interactiveObjectTypes, setInteractiveObjectTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const Modal = ({ isOpen, onClose, questionData }) => {
    if (!isOpen) return null;
  
    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <span className={styles.close} onClick={onClose}>
            &times;
          </span>
          <h2>Modal Title</h2>
          <p>Modal Content Here</p>
          <p>{questionData}</p>
        </div>
      </div>
    );
  };
  const getQuestionTypes = async () => {
    const res = await axios.get("interactive-object-types");
    setInteractiveObjectTypes(res.data);
    const types = res.data.map((item) => item.typeName);
    setTypes(types);
  };

  React.useEffect(() => {
    getQuestionTypes();
  }, []);

  const onClickExcelFile = () => {
    window.open("/excel-file", "_blank");
  };

  const onSubmit = async (values) => {
    const data = {
      ...values,
      domainName: getDomainName(values.domainId),
      subDomainName: getSubDomainName(values.domainId, values.subDomainId),
      objects: interactiveObjectTypes,
    };
    const id = await saveObject(data);
    setFormState({ id, ...data });
    const { type } = values;
    navigate(`/add-question/${type}`);
    if (type === "MCQ") {
      navigate("/add-question/multiple-choice/manual");
    } else if (type === "true-false") {
      navigate("/add-question/true-false/manual");
    } else if (type === "FillTheBlank") {
      navigate("/add-question-si/filltheblanks/manual");
    } else if (type === "drag-the-words") {
      navigate("/add-question/drag-the-words/manual");
    } else if (values.questionType === "essay-question") {
      navigate("/add-question/essay-question/manual");
    } else if (type === "SI") {
      navigate("/SI-page");
    }
    openModal(values); // Open the modal with question data
  };

  const onSubmitOcr = async (values) => {
    const data = {
      ...values,
      domainName: getDomainName(values.domainId),
      subDomainName: getSubDomainName(values.domainId, values.subDomainId),
    };

    // const id = await saveObject(data);
    const selectedTypeObject = interactiveObjectTypes.find(
      (item) => item.typeName === values.type
    );
    setFormState({
      // id,
      ...data,
      labels: selectedTypeObject.labels,
      types: interactiveObjectTypes,
    });
    navigate("/scan-and-upload");
  };

  const saveObject = async (data) => {
    const res = await axios.post("/interactive-objects", {
      ...data,
      isAnswered: "g", // g, y , r
      parameters: {},
    });
    toast.success("Question created successfully!");
    return res.data;
  };

  const openModal = (data) => {
    setQuestionData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles["add-question"]}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend>Add Object</legend>
          <div>
            <Input
              label="title"
              name="questionName"
              type="text"
              register={register}
              errors={errors}
            />
            <div className={styles.row}>
              <Select
                label="object owner"
                name="objectOwner"
                register={register}
                errors={errors}
              >
                {ownerList.map((item, idx) => (
                  <option key={idx} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select
                label="domain"
                name="domainId"
                register={register}
                errors={errors}
              >
                {domainList?.map((domain, idx) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className={styles.row}>
              <Select
                label="sub domain"
                name="subDomainId"
                register={register}
                errors={errors}
              >
                {subDomainList?.[watch().domainId]?.map((subDomain, idx) => (
                  <option key={subDomain.id} value={subDomain.id}>
                    {subDomain.name}
                  </option>
                ))}
              </Select>
              <Input
                label="topic"
                name="topic"
                register={register}
                errors={errors}
              />
            </div>
            <div className={styles.row}>
              <Select
                label="language"
                name="language"
                register={register}
                errors={errors}
              >
                {languageList.map((item, idx) => (
                  <option key={idx} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </Select>
              <Select
                label="question type"
                name="type"
                register={register}
                errors={errors}
              >
                {types.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            <div className={styles.actions}>
              <Button
                variant="contained"
                startIcon={<DesignServicesIcon />}
                type="submit"
              >
                Manual Form
              </Button>
              <Button
                variant="contained"
                onClick={onClickExcelFile}
                startIcon={<InsertDriveFileIcon />}
              >
                Excel File
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmitOcr)}
                startIcon={<ScannerIcon />}
              >
                Scan and Upload
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
      {/* Modal component */}
      <Modal isOpen={isModalOpen} onClose={closeModal} questionData={questionData} />
    </div>
  );
};

export default AddObject;
