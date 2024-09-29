import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, updateEvent, queryClient } from "../../utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["events", id] });
      const prevData = queryClient.getQueryData(["events", id]);
      queryClient.setQueryData(["events", id], data.event);
      return { prevData };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", id], context.prevData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", id]);
    },
  });

  const navigate = useNavigate();

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isLoading) {
    content = <LoadingIndicator />;
  }
  if (isError) {
    console.log(error);
    content = (
      <ErrorBlock
        title={"There is an error occured fetching this event"}
        message={
          error.message ||
          "we are sorry for inconvenience, there is an error occured from fetching data from this event."
        }
      />
    );
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
