import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import Header from "../Header.jsx";
import Modal from "../UI/Modal.jsx";

import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../utils/http.js";
export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const {
    mutate,
    isPending: deletePending,
    isError: deleteIsError,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", id],
        refetchType: "none",
      }),
        navigate("/events");
    },
  });

  function handleDeletion() {
    mutate({ id });
  }
  function handleDeleteModal() {
    if (isDeleting) {
      setIsDeleting(false);
    }
    setIsDeleting(true);
  }

  let content;

  if (isLoading || deletePending) {
    content = <LoadingIndicator />;
  }
  if (isError || deleteIsError) {
    content = (
      <>
        <ErrorBlock
          title="Cannot fetch the event to be updated"
          message={
            deleteError.info?.message ||
            isError.info?.message ||
            "we're sorry, there is an error occured while fetching the selected event."
          }
        />
        <div className="form-actions">
          <Link className="button" to="../">
            okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    const formattedData = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    content = (
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleDeleteModal}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedData}, {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleDeleteModal}>
          <h2>are you sure you want to delete this event?</h2>
          <p>Do you really want to delete this event? this can't be undone.</p>
          <div className="form-actions">
            {deletePending && <p>deleting...</p>}
            {!deletePending && (
              <>
                <button className="button-text" onClick={handleDeleteModal}>
                  cancel
                </button>
                <button className="button" onClick={handleDeletion}>
                  delete
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {content}
    </>
  );
}
