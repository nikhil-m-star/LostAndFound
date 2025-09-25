function Reportfound(){
    return(
        <div className="page report-found">
            <h1>Report Found</h1>
            <form>
                <input type="text" placeholder="Item name"></input>
                <textarea name="" id="" placeholder="Description"></textarea>
                <input type = "text" placeholder="Location"></input>
                <button type = "submit">Submit</button>
            </form>
        </div>
    );
}
export default Reportfound;