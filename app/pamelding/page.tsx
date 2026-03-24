import React from "react";

function page() {
  return (
    <div>
      <form className="grid">
        <label htmlFor="name">Navn</label>
        <input type="text" id="name" name="name" placeholder="Navn" required />
        <label htmlFor="email">E-post</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="E-post"
          required
        />
        <label htmlFor="image">Last opp bilde</label>
        <input type="file" id="image" name="image" accept="image/*" />

        <button type="submit">Meld deg på!</button>
      </form>
    </div>
  );
}

export default page;
