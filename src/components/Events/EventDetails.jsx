import { Link, Outlet, useParams, useNavigate } from "react-router-dom";

import Header from "../Header.jsx";

import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../utils/http.js";
export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", { id }],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const mutateObject = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      }),
        navigate("/events");
    },
  });

  function onDelete() {
    mutateObject.mutate({ id });
  }

  let content;

  if (isLoading || mutateObject.isLoading) {
    content = <LoadingIndicator />;
  }
  if (isError || mutateObject.isError) {
    content = (
      <ErrorBlock
        title="Cannot fetch the event to be updated"
        message={
          error.info?.message ||
          "we're sorry, there is an error occured while fetching the selected event."
        }
      />
    );
  }

  if (data || mutateObject.data) {
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
            <button onClick={onDelete}>Delete</button>
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
