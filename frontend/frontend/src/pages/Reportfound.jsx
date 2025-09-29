function Reportfound(){
    return(
        <div className="page report-found">
            <div className="glass">
                <h1>Found</h1>
                <form>
                    <input type="text" placeholder="Item name" />
                    <textarea name="" id="" placeholder="Description" />
                    <input type = "text" placeholder="Location" />
                    <button type = "submit">Submit</button>
                </form>
            </div>
        </div>
    );
}
export default Reportfound;