import {
    Button,
    Card,
    Badge,
} from "../../components/UI";

function Matches() {
    return (
        <div className="space-y-6">

            <h1 className="text-2xl font-semibold">
                UI Preview
            </h1>

            <Card>

                <h2 className="text-lg font-semibold">
                    Alice Johnson
                </h2>

                <div className="flex gap-2 mt-3">

                    <Badge>
                        Docker
                    </Badge>

                    <Badge variant="success">
                        Advanced
                    </Badge>

                </div>

                <Button className="mt-6">
                    Send Request
                </Button>

            </Card>

        </div>
    );
}

export default Matches;