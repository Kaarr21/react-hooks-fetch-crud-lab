import React from "react";
import "whatwg-fetch";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { server } from "../mocks/server";

import App from "../components/App";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays question prompts after fetching", async () => {
  render(<App />);

  fireEvent.click(screen.queryByText(/View Questions/));

  expect(await screen.findByText(/lorem testum 1/g)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 2/g)).toBeInTheDocument();
});

test("creates a new question when the form is submitted", async () => {
  render(<App />);

  // wait for first render of list (otherwise we get a React state warning)
  await screen.findByText(/lorem testum 1/g);

  // click form page
  fireEvent.click(screen.queryByText("New Question"));

  // fill out form
  fireEvent.change(screen.queryByLabelText(/Prompt/), {
    target: { value: "Test Prompt" },
  });
  fireEvent.change(screen.queryByLabelText(/Answer 1/), {
    target: { value: "Test Answer 1" },
  });
  fireEvent.change(screen.queryByLabelText(/Answer 2/), {
    target: { value: "Test Answer 2" },
  });
  fireEvent.change(screen.queryByLabelText(/Correct Answer/), {
    target: { value: "1" },
  });

  // submit form
  fireEvent.submit(screen.queryByText(/Add Question/));

  // view questions
  fireEvent.click(screen.queryByText(/View Questions/));

  expect(await screen.findByText(/Test Prompt/g)).toBeInTheDocument();
  expect(await screen.findByText(/lorem testum 1/g)).toBeInTheDocument();
});

test("deletes the question when the delete button is clicked", async () => {
  const { rerender } = render(<App />);

  fireEvent.click(screen.queryByText(/View Questions/));

  // Wait for the question to be rendered
  await screen.findByText(/lorem testum 1/g);

  // Click the delete button
  fireEvent.click(screen.queryAllByText("Delete Question")[0]);

  // Wait for the question to be removed from the DOM
  await waitFor(() => {
    expect(screen.queryByText(/lorem testum 1/g)).not.toBeInTheDocument();
  });

  // Rerender the component and check that the question list is updated
  rerender(<App />);

  // Check that only the remaining question is visible
  await screen.findByText(/lorem testum 2/g);

  expect(screen.queryByText(/lorem testum 1/g)).not.toBeInTheDocument();
});
test("updates the answer when the dropdown is changed", async () => {
  const { rerender } = render(<App />);

  fireEvent.click(screen.queryByText(/View Questions/));

  await screen.findByText(/lorem testum 2/g);

  // Change the dropdown value to "3"
  fireEvent.change(screen.queryAllByLabelText(/Correct Answer/)[0], {
    target: { value: "3" },
  });

  // Wait for the dropdown value to update correctly
  await waitFor(() => {
    expect(screen.queryAllByLabelText(/Correct Answer/)[0].value).toBe("3");
  });

  // Rerender and ensure the value persists
  rerender(<App />);

  // Ensure the value is still "3" after rerendering
  expect(screen.queryAllByLabelText(/Correct Answer/)[0].value).toBe("3");
});